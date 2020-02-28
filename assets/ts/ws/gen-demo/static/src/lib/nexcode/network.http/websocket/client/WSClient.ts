import { ExceptionEventArgs } from '@/lib/nexcode/types';
import { SimpleEventDispatcher } from 'strongly-typed-events';
import { Delay } from '@/lib/nexcode/types';

import { IWSClient } from './IWSClient';
import { IWSConnectionContext } from '../types/IWSConnectionContext';
import { ClientContractCollection } from '../contracts/base/ClientContractCollection';
import { ConnectionClientContractBase } from '../contracts/connection/base/ConnectionClientContractBase';
import { NoneConnectionClientContract } from '../contracts/connection/protocols/none/NoneConnectionClientContract';
import { WSConnectionCloseEventArgs } from '../types/WSConnectionCloseEventArgs';

import { IWSClientSocket } from './IWSClientSocket';
import { HubClientContract } from '../contracts/hub/HubClientContract';
import { RestClientContract } from '../contracts/rest/RestClientContract';

export class WSClient implements IWSClient {
    // [ field ]
    private _socketCreation: (wsClient: IWSClient) => Promise<IWSClientSocket>;
    private _socket: IWSClientSocket | null = null;

    private _delayTimeout: Delay | null = null;
    private _delayConnection: Delay | null = null;
    private _closeReason: string | null = null;

    private _autoReconnect = true;
    private _reconnectInterval = 1000;
    private _timeoutInterval = 2000;
    private _url: string;
    private _context: IWSConnectionContext | null = null;
    private _connectionContract: ConnectionClientContractBase;
    private _contracts: ClientContractCollection;
    private _isOpened: boolean = false;
    private _isConnecting: boolean = false;

    private setIsOpened(value: boolean) {
        if (this._isOpened != value) {
            this._isOpened = value;
            this.onIsOpenedChange.dispatch(value);
        }
    }
    private setIsConnecting(value: boolean) {
        if (this._isConnecting != value) {
            this._isConnecting = value;
            this.onIsConnectingChange.dispatch(value);
        }
    }

    // [ constructor ]
    constructor(url: string, connectionContract: ConnectionClientContractBase, socketCreation: (wsClient: IWSClient) => Promise<IWSClientSocket>) {
        this._socketCreation = socketCreation;
        this._url = url;
        this._connectionContract = connectionContract == null
            ? new NoneConnectionClientContract()
            : connectionContract;

        this._connectionContract.client = this;
        this._connectionContract.onOpenConnection.sub(() => {
            this.setIsOpened(true);
            this.onOpen.dispatch(this.context);
            this.contracts._open(this.context);
        });
        this._contracts = new ClientContractCollection(this);
        this.contracts.add(new HubClientContract());
        this.contracts.add(new RestClientContract());
        this.setIsOpened(false);
    }

    // [ properties ]
    public Socket(): IWSClientSocket | null {
        return this._socket;
    }

    // [ IWSClient ]
    //#region [ properties ]
    public get autoReconnect(): boolean {
        return this._autoReconnect;
    }
    public set autoReconnect(value: boolean) {
        this._autoReconnect = value;
    }
    public get reconnectInterval(): number {
        return this._reconnectInterval;
    }
    public set reconnectInterval(value: number) {
        this._reconnectInterval = value;
    }
    public get timeoutInterval(): number {
        return this._timeoutInterval;
    }
    public set timeoutInterval(value: number) {
        this._timeoutInterval = value;
    }
    public get url(): string {
        return this._url;
    }
    public set url(value: string) {
        this._url = value;
        this.onUrlChange.dispatch(value);
    }
    public get context(): IWSConnectionContext | null {
        return this._context;
    }
    public set context(value: IWSConnectionContext | null) {
        this._context = value;
    }

    public get connectionContract(): ConnectionClientContractBase {
        return this._connectionContract;
    }
    public get contracts(): ClientContractCollection {
        return this._contracts;
    }
    public get isOpened(): boolean {
        return this._isOpened;
    }

    public get isConnecting(): boolean {
        return this._isConnecting;
    }

    public get rest(): RestClientContract {
        return this._contracts.get('rest') as RestClientContract;
    }
    public get hub(): HubClientContract {
        return this._contracts.get('hub') as HubClientContract;
    }
    //#endregion

    //#region [ events ]
    public onIsOpenedChange = new SimpleEventDispatcher<boolean>();
    public onIsConnectingChange = new SimpleEventDispatcher<boolean>();
    public onUrlChange = new SimpleEventDispatcher<string>();

    public onConnecting = new SimpleEventDispatcher<string>();
    public onOpen = new SimpleEventDispatcher<IWSConnectionContext | null>();
    public onReceive = new SimpleEventDispatcher<string>();
    public onSend = new SimpleEventDispatcher<string>();
    public onClose = new SimpleEventDispatcher<WSConnectionCloseEventArgs>();
    public onError = new SimpleEventDispatcher<ExceptionEventArgs>();
    //#endregion

    public connect(autoreconnect?: boolean) {
        if (this._socket != null) {
            throw new Error('socket is opening or opened');
        }

        this._autoReconnect = autoreconnect || true;
        this.setIsConnecting(true);

        this._socketCreation(this)
            .then(socket => {
                this._socket = socket;

                this._socket.onopen = () => { this._onOpen(); };
                this._socket.onmessage = (e) => { this._onReceive(e.data); };
                this._socket.onclose = (e) => { this._onClose(new WSConnectionCloseEventArgs(e.code, e.reason, e.wasClean)); };
                this._socket.onerror = () => { this._onError(); };

                this._delayTimeout = new Delay(() => {
                    if (this._socket != null) {
                        this._closeReason = 'connection timeout';
                        this._socket.close(1000, 'connection timeout');
                    }
                }).start(this._timeoutInterval);
            });

        this.onConnecting.dispatch(this.url);
    }
    close(reason: string) {
        this.setIsConnecting(false);
        this._autoReconnect = false;

        if (this._delayTimeout != null) {
            this._delayTimeout.stop();
        }

        if (this._delayConnection != null) {
            this._delayConnection.stop();
        }

        if (this._socket != null) {
            this._socket.close(1000, reason ? reason : 'closed by client');
        }
    }
    send(msg: string) {
        if (this._isOpened == false) {
            return;
        }

        if (this._socket != null) {
            this._socket.send(msg);
            this.onSend.dispatch(msg);
        }
    }

    // [ private ISocket implementation]
    private _onOpen() {
        if (this._delayTimeout != null) {
            this._delayTimeout.stop();
        }

        if (this._delayConnection != null) {
            this._delayConnection.stop();
        }

        this.setIsOpened(true);
        this.setIsConnecting(false);

        this._connectionContract._open(null);
    }
    private _onClose(e: WSConnectionCloseEventArgs) {
        if (this._delayTimeout != null) {
            this._delayTimeout.stop();
        }

        if (this._delayConnection != null) {
            this._delayConnection.stop();
        }

        const reason = this._closeReason
            ? this._closeReason
            : e.reason
                ? e.reason
                : 'connection error';

        const ev = new WSConnectionCloseEventArgs(e.code, reason, e.wasClean);
        this._closeReason = null;
        this.setIsOpened(false);
        this._context = null;
        this._socket = null;

        if (!this._isConnecting) {
            this.onClose.dispatch(ev);
            this._connectionContract._close(ev);
            this._contracts._close(ev);
        }

        if (this._autoReconnect) {
            this._delayConnection = new Delay(() => { this.connect(this._autoReconnect); }).start(this.reconnectInterval);
        }
    }
    public _onReceive(msg: string) {
        const json = JSON.parse(msg);
        this.onReceive.dispatch(msg);
        this._connectionContract._receive(msg, json);
        this._contracts._receive(msg, json);
    }
    private _onError() {
        let ev: ExceptionEventArgs;
        if (!this._isOpened) {
            ev = new ExceptionEventArgs('Connection fail');
        } else {
            ev = new ExceptionEventArgs('undefined');
        }
        this.onError.dispatch(ev);
        this._connectionContract._error(ev);
        this._contracts._error(ev);
    }
}

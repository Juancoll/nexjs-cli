import { SimpleEventDispatcher } from 'strongly-typed-events';
import * as http from '@/lib/nexcode/network.http';

export abstract class ServiceProxyBase<TState> {
    private _state: TState | null = null;
    private _ws: http.websocket.IWSClient;
    private _serverInstanceName: string;
    private _serviceInstanceName: string;
    private _isAvalaible: boolean = false;

    public get isAvalaible() {
        return this._isAvalaible;
    }
    public get ws() {
        return this._ws;
    }
    public get serverInstanceName() {
        return this._serverInstanceName;
    }
    public get serviceInstanceName() {
        return this._serviceInstanceName;
    }
    public get state() {
        return this._state;
    }

    onStateUpdate = new SimpleEventDispatcher<TState>();
    onAvalaibleChange = new SimpleEventDispatcher<boolean>();

    //#region [ constructor ]
    constructor(ws: http.websocket.IWSClient, serverInstanceName: string, serviceInstanceName: string) {
        this._ws = ws;
        this._serverInstanceName = serverInstanceName;
        this._serviceInstanceName = serviceInstanceName;
        this._state = null;

        // service sync
        this._ws.onOpen.sub(this.onOpenHandler.bind(this));
        this._ws.onClose.sub(this.onCloseHandler.bind(this));
        this._ws.hub.subscribe(this._serviceInstanceName)
            .on('onStateUpdate', this.onStateUpdateHandler.bind(this));
        // server sync
        this._ws.hub.subscribe(this._serverInstanceName)
            .on('onAddConnection', this.onAddConnectionHandler.bind(this))
            .on('onRemoveConnection', this.onRemoveConnectionHandler.bind(this));
    }
    //#endregion

    //#region [ public ]
    public async getState(): Promise<TState> {
        const res = await this._ws.rest.requestAsync(this._serviceInstanceName, 'getState');
        if (res.isSuccess) {
            this._state = res.data as TState;
            return this._state;
        }
        throw new Error(res.error);
    }
    public async getSettings(): Promise<TState> {
        const res = await this._ws.rest.requestAsync(this._serviceInstanceName, 'getSettings');
        if (res.isSuccess) {
            this._state = res.data as TState;
            return this._state;
        }
        throw new Error(res.error);
    }
    //#endregion

    //#region [ proptected]
    protected publish(name: string, data: any = null) {
        if (this.isAvalaible && this.ws.isOpened) {
            this.ws.hub.publish(this._serviceInstanceName, name, data);
        }
    }
    protected subscribe(name: string, action: (data: any) => void) {
        this.ws.hub.subscribe(this._serviceInstanceName)
            .on(name, action);
    }
    protected async request<T>(name: string, data: any = null): Promise<T> {
        if (this.isAvalaible && this.ws.isOpened) {
            const res = await this.ws.rest.requestAsync(this.serviceInstanceName, name, data);
            if (!res.isSuccess) {
                throw new Error(res.error);
            }
            return res.data;
        }
        throw new Error('service not avalaible');

    }
    //#endregion

    //#region [ private ]
    public async isServiceAvaible(): Promise<boolean> {
        const res = await this._ws.rest.requestAsync(this._serverInstanceName, 'getConnections');
        if (res.isSuccess) {
            const conn = (res.data as http.websocket.IWSConnectionContext[])
                .find(x => this.getUID(x) == this._serviceInstanceName);
            if (conn) {
                return true;
            }
        }
        return false;
    }

    private async onOpenHandler() {
        this._isAvalaible = await this.isServiceAvaible();

        if (this._isAvalaible) {
            this._state = await this.getState();
        }

        this.onAvalaibleChange.dispatch(this._isAvalaible);

        if (this._isAvalaible && this._state != null) {
            this.onStateUpdate.dispatch(this._state);
        }
    }
    private async onCloseHandler() {
        this._isAvalaible = false;
        this.onAvalaibleChange.dispatch(this._isAvalaible);
    }
    private async onStateUpdateHandler(data: any) {
        this._state = data as TState;
        this.onStateUpdate.dispatch(this._state);
    }
    private async onAddConnectionHandler(data: any) {
        const conn = data as http.websocket.IWSConnectionContext;
        if (this.getUID(conn) == this._serviceInstanceName) {
            this._isAvalaible = true;

            this._state = await this.getState();

            this.onAvalaibleChange.dispatch(this._isAvalaible);
            this.onStateUpdate.dispatch(this._state);
        }
    }
    private async onRemoveConnectionHandler(data: any) {
        const conn = data as http.websocket.IWSConnectionContext;
        if (this.getUID(conn) == this._serviceInstanceName) {
            this._isAvalaible = false;
            this.onAvalaibleChange.dispatch(this._isAvalaible);
        }
    }
    private getUID(conn: http.websocket.IWSConnectionContext): string {
        // console.log(conn.connectionData.clientData.uid);
        return (conn.connectionData.clientData as http.websocket.IBasicClientData).uid;
    }
    //#endregion
}

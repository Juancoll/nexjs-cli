import { SimpleEventDispatcher } from 'strongly-typed-events';
import { ExceptionEventArgs } from '@/lib/nexcode/types';

import { IConnectionMessage } from '../types/IConnectionMessage';
import { ClientContractBase } from '../../base/ClientContractBase';
import { IConnectionClientContract } from '../types/IConnectionClientContract';
import { IWSClient } from '../../../client/IWSClient';
import { IWSConnectionContext } from '../../../types/IWSConnectionContext';
import { WSConnectionCloseEventArgs } from '../../../types/WSConnectionCloseEventArgs';

export abstract class ConnectionClientContractBase extends ClientContractBase implements IConnectionClientContract {
    // #region [ ClientContractBase ]
    client: IWSClient | null = null;
    get contractName(): string {
        return 'connection';
    }
    //#endregion

    //#region [messages]
    private protocolMsg(): IConnectionMessage {
        return {
            contract: this.contractName,
            protocol: this.protocol,
            command: 'protocol',
            data: this.protocol,
        } as IConnectionMessage;
    }
    //#endregion

    //#region [IClientConnectionContract]
    onOpenConnection = new SimpleEventDispatcher<IWSConnectionContext>();
    protected _onSetClient(client: IWSClient): void { /* empty */ }
    protected _onOpen(context: IWSConnectionContext): void {
        if (this.client) {
            this.client.context = {} as IWSConnectionContext;
            this.client.context.isConnected = false;
            this.client.context.connectionProtocol = this.protocol;
            this.client.send(JSON.stringify(this.protocolMsg()));
        }
    }
    protected _onReceive(msg: string, json: any): void {
        const connMsg = json as IConnectionMessage;
        try {
            switch (connMsg.command) {
                case 'acceptProtocol':
                    if (this.client && this.client.context) {
                        this.client.context.id = json.data.id;
                        this.client.context.ip = json.data.ip;
                        this.client.context.port = json.data.port;
                    }

                    this.onStartProtocol();
                    break;
                case 'accept':
                    if (this.client && this.client.context) {
                        this.client.context.id = json.data.id;
                        this.client.context.ip = json.data.ip;
                        this.client.context.port = json.data.port;
                        this.client.context.isConnected = true;
                        this.onOpenConnection.dispatch(this.client.context);
                    }
                    break;

                case 'reject':
                    if (this.client && this.client.context) {
                        this.client.context.id = json.data.id;
                        this.client.context.ip = json.data.ip;
                        this.client.context.port = json.data.port;
                        this.client.context.isConnected = false;
                        const reason = json.data.reason;

                        this.client.close(reason);
                    }
                    break;
            }
            this.onReceiveConnectionMessage(connMsg);
        } catch (error) {
            if (this.client) {
                if (typeof error === 'string') {
                    this.client.close(error);
                }
                if (error instanceof Error) {
                    this.client.close((error as Error).message);
                } else {
                    this.client.close('unknow');
                }
            }
        }
    }

    protected _onClose(e: WSConnectionCloseEventArgs): void { /* empty */ }
    protected _onError(e: ExceptionEventArgs): void { /* empty */ }
    //#endregion

    //#region [ abstract ]
    public abstract protocol: string;
    protected abstract onStartProtocol(): void;
    protected abstract onReceiveConnectionMessage(msg: IConnectionMessage): void;
    //#endregion
}

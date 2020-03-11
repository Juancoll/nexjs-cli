import { ExceptionEventArgs } from '@/lib/nexcode/types';
import { IClientContract } from './IClientContract';
import { IWSClient } from '../../client/IWSClient';
import { IWSConnectionContext } from '../../types/IWSConnectionContext';
import { WSConnectionCloseEventArgs } from '../../types/WSConnectionCloseEventArgs';

export abstract class ClientContractBase implements IClientContract {

    private _client: IWSClient | null = null;
    private _onErrorActions = new Array<(e: ExceptionEventArgs) => void>();
    public abstract contractName: string;

    public get client(): IWSClient | null {
        return this._client;
    }
    public set client(value: IWSClient | null) {
        this._client = value;
        this._onSetClient(this._client);
    }

    public _open(context: IWSConnectionContext | null) { this._onOpen(context); }
    public _close(e: WSConnectionCloseEventArgs) { this._onClose(e); }
    public _error(e: ExceptionEventArgs) { this._onError(e); }
    public _receive(msg: string, json: any) {
        if (json.contract !== this.contractName) {
            return;
        }
        this._onReceive(msg, json);
    }

    public onError(action: (e: ExceptionEventArgs) => void): IClientContract {
        this._onErrorActions.push(action);
        return this as IClientContract;
    }
    protected callOnErrorActions(e: ExceptionEventArgs): void {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this._onErrorActions.length; i++) {
            this._onErrorActions[i](e);
        }
    }

    protected abstract _onSetClient(client: IWSClient | null): void;
    protected abstract _onOpen(context: IWSConnectionContext | null): void;
    protected abstract _onClose(e: WSConnectionCloseEventArgs): void;
    protected abstract _onError(e: ExceptionEventArgs): void;
    protected abstract _onReceive(msg: string, json: any): void;
}

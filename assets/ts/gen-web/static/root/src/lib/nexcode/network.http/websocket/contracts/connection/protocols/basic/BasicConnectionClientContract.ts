import { ConnectionClientContractBase } from '../../base/ConnectionClientContractBase';
import { IConnectionMessage } from '../../types/IConnectionMessage';
import { IBasicConnectionContractData } from './IBasicConnectionContractData';

export class BasicConnectionClientContract<TClientData, TServerData> extends ConnectionClientContractBase {

    //#region [ fields ]
    private _onSendClientData: null | (() => TClientData) = null;
    private _onSendClientDataAsync: null | (() => Promise<TClientData>) = null;
    private _onReceiveServerData: null | ((clientData: TClientData | null, serverData: TServerData | null) => void) = null;

    private _data: IBasicConnectionContractData<TClientData, TServerData> = {
        clientData: null,
        serverData: null,
    };
    //#endregion

    //#region [ messages factory ]
    private clientDataMsg(data: TClientData): IConnectionMessage {
        return {
            contract: this.contractName,
            protocol: this.protocol,
            command: 'clientData',
            data,
        } as IConnectionMessage;
    }
    //#endregion

    //#region [ ConnectionClientContractBase ]
    public get protocol(): string {
        return 'basic';
    }
    protected async onStartProtocol() {
        if (!this.client || !this.client.context) {
            throw new Error('client or context are null');
        }
        try {
            this.client.context.connectionData = this._data;

            if (this._onSendClientData != null) {
                this._data.clientData = this._onSendClientData();
            } else if (this._onSendClientDataAsync != null) {
                this._data.clientData = await this._onSendClientDataAsync();
            } else {
                throw new Error('no onSendClientData method defined.');
            }

            this.client.send(JSON.stringify(this.clientDataMsg(this._data.clientData)));
        } catch (error) {
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
    protected onReceiveConnectionMessage(msg: IConnectionMessage): void {
        if (!this.client || !this._data) {
            throw new Error('client or _data are null');
        }

        try {
            switch (msg.command) {
                case 'serverData':
                    this._data.serverData = msg.data as TServerData;
                    if (this._onReceiveServerData != null) {
                        this._onReceiveServerData(this._data.clientData, this._data.serverData);
                    }
                    break;
            }
        } catch (error) {
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
    //#endregion

    //#region [ public ]
    public onSendClientData(func: () => TClientData): BasicConnectionClientContract<TClientData, TServerData> {
        this._onSendClientData = func;
        return this;
    }
    public onSendClientDataAsync(func: () => Promise<TClientData>): BasicConnectionClientContract<TClientData, TServerData> {
        this._onSendClientDataAsync = func;
        return this;
    }
    public onReceiveServerData(action: (
        clientData: TClientData | null,
        serverData: TServerData | null,
    ) => void)
        : BasicConnectionClientContract<TClientData, TServerData> {
        this._onReceiveServerData = action;
        return this;
    }
    //#endregion
}

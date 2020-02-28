import { ConnectionClientContractBase } from '../../base/ConnectionClientContractBase';
import { IConnectionMessage } from '../../types/IConnectionMessage';
import { IAuthConnectionContractData } from './IAuthConnectionContractData';

export class AuthConnectionClientContract<TClientData, TServerData, TVerificationData, TConfirmationData> extends ConnectionClientContractBase {

    //#region [ fields ]
    private _onSendClientData: null | (() => TClientData) = null;
    private _onSendClientDataAsync: null | (() => Promise<TClientData>) = null;

    private _onReceiveServerData: null | ((clientData: TClientData | null, serverData: TServerData | null) => TVerificationData) = null;
    private _onReceiveServerDataAsync: null | ((clientData: TClientData | null, serverData: TServerData | null) => Promise<TVerificationData>) = null;

    private _onReceiveConfirmationData: null | ((
        clientData: TClientData | null,
        serverData: TServerData | null,
        verificationData: TVerificationData | null,
        confirmationData: TConfirmationData | null,
    ) => void) = null;

    private _data: IAuthConnectionContractData<TClientData, TServerData, TVerificationData, TConfirmationData> = {
        clientData: null,
        serverData: null,
        verificationData: null,
        confirmationData: null,
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
    private verificationDataMsg(data: TVerificationData): IConnectionMessage {
        return {
            contract: this.contractName,
            protocol: this.protocol,
            command: 'verificationData',
            data,
        } as IConnectionMessage;
    }
    //#endregion

    //#region [ ConnectionClientContractBase ]
    public get protocol(): string {
        return 'auth';
    }
    protected async onStartProtocol() {
        if (!this.client || !this.client.context) {
            throw new Error('client and or context are null');
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
    protected async onReceiveConnectionMessage(msg: IConnectionMessage) {
        if (!this.client || !this._data) {
            throw new Error('client and or _data are null');
        }
        try {
            switch (msg.command) {
                case 'serverData':
                    this._data.serverData = msg.data as TServerData;
                    if (this._onReceiveServerData != null) {
                        this._data.verificationData = this._onReceiveServerData(this._data.clientData, this._data.serverData);
                    } else if (this._onReceiveServerDataAsync != null) {
                        this._data.verificationData = await this._onReceiveServerDataAsync(this._data.clientData, this._data.serverData);
                    } else {
                        throw new Error('no _onReceiveServerData method defined.');
                    }

                    this.client.send(JSON.stringify(this.verificationDataMsg(this._data.verificationData)));
                    break;

                case 'confirmationData':
                    this._data.confirmationData = msg.data as TConfirmationData;
                    if (this._onReceiveConfirmationData != null) {
                        this._onReceiveConfirmationData(
                            this._data.clientData,
                            this._data.serverData,
                            this._data.verificationData,
                            this._data.confirmationData,
                        );
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
    public onSendClientData(func: () => TClientData)
        : AuthConnectionClientContract<TClientData, TServerData, TVerificationData, TConfirmationData> {
        this._onSendClientData = func;
        return this;
    }
    public onSendClientDataAsync(func: () => Promise<TClientData>)
        : AuthConnectionClientContract<TClientData, TServerData, TVerificationData, TConfirmationData> {
        this._onSendClientDataAsync = func;
        return this;
    }

    public onReceiveServerData(func: (
        clientData: TClientData | null,
        serverData: TServerData | null,
    ) => TVerificationData)
        : AuthConnectionClientContract<TClientData, TServerData, TVerificationData, TConfirmationData> {
        this._onReceiveServerData = func;
        return this;
    }
    public onReceiveServerDataAsync(func: (
        clientData: TClientData | null,
        serverData: TServerData | null,
    ) => Promise<TVerificationData>)
        : AuthConnectionClientContract<TClientData, TServerData, TVerificationData, TConfirmationData> {
        this._onReceiveServerDataAsync = func;
        return this;
    }

    public onReceiveConfirmationData(action: (
        clientData: TClientData | null,
        serverData: TServerData | null,
        verificationData: TVerificationData | null,
        confirmationData: TConfirmationData | null,
    ) => void)
        : AuthConnectionClientContract<TClientData, TServerData, TVerificationData, TConfirmationData> {
        this._onReceiveConfirmationData = action;
        return this;
    }
    //#endregion
}

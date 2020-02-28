import { INodeSettings } from '@/lib/nexcode/types';
import * as http from '@/lib/nexcode/network.http';
import { IServiceSettingsBase } from './settings/IServiceSettingsBase';

export abstract class ServiceBase<TSettings extends IServiceSettingsBase> {

    //#region [ fields ]
    private _socketCreation: (wsClient: http.websocket.IWSClient) => Promise<http.websocket.IWSClientSocket>;
    private _exit = false;
    private _instanceName: string;
    private _serviceSettings: TSettings;
    private _nodeSettings: INodeSettings;
    private _wsclient: http.websocket.WSClient | undefined;
    //#endregion

    //#region [ properties ]
    public get instanceName(): string {
        return this._instanceName;
    }
    public get serviceSettings(): TSettings {
        return this._serviceSettings;
    }
    public get nodeSettings(): INodeSettings {
        return this._nodeSettings;
    }
    public get wsclient(): http.websocket.WSClient | undefined {
        return this._wsclient;
    }
    //#endregion

    //#region [ constructor]
    constructor(
        instanceName: string,
        nodeSettings: INodeSettings,
        settings: TSettings,
        socketCreation: (wsClient: http.websocket.IWSClient) => Promise<http.websocket.IWSClientSocket>,
    ) {
        this._socketCreation = socketCreation;
        this._instanceName = instanceName;
        this._nodeSettings = nodeSettings;
        this._serviceSettings = settings;
    }
    //#endregion

    //#region [ public ]
    public start() {
        console.log('[ServiceBase] start');

        const contract = new http.websocket.BasicConnectionClientContract<http.websocket.IBasicClientData, http.websocket.IBasicServerData>()
            .onSendClientData(() => {
                return this.serviceSettings.wsClient.server.connectionData;
            });

        this._wsclient = new http.websocket.WSClient(
            this.serviceSettings.wsClient.server.url,
            contract,
            this._socketCreation);

        console.log(`[ServiceBase] hub subscribe to channel '${this.instanceName}' message 'exit' message`);
        this._wsclient.hub.subscribe(this.instanceName)
            .on('exit', (data) => {
                console.log('[ServiceBase] hub receive \'exit\' message');
                this._exit = true;
            });

        const result: any = this.onStart();
        // Is Promise ?
        if (typeof result != 'undefined' && typeof result.then != 'undefined') {
            result.then(() => {
                if (this._wsclient) {
                    console.log('[ServiceBase] setupHubContract(...)');
                    this.setupHubContract(this._wsclient.hub);

                    console.log('[ServiceBase] setupRestContract(...)');
                    this.setupRestContract(this._wsclient.rest);
                }
            });
        } else {
            console.log('[ServiceBase] setupHubContract(...)');
            this.setupHubContract(this._wsclient.hub);

            console.log('[ServiceBase] setupRestContract(...)');
            this.setupRestContract(this._wsclient.rest);
        }
        let showClose = true;
        let showConnect = true;
        this._wsclient.onClose.sub(e => {
            if (showClose) {
                console.log('...onClose( ' + e.reason + '). Retry ...');
                showClose = false;
            }
        });
        this._wsclient.onConnecting.sub((url) => {
            if (showConnect) {
                console.log(`[ServiceBase] http.websocket.onConnect( ${url} )...`);
                showConnect = false;
            }
        });
        this._wsclient.onOpen.sub(context => {
            console.log(`[ServiceBase] http.websocket.onOpen( ${context ? context.ip : 'null'} )...`);
            showClose = true; showConnect = false;
        });
        this._wsclient.connect(true);
    }
    public stop() {
        if (!this._wsclient) {
            throw new Error('websocket is null');
        }

        console.log('[ServiceBase] stop()');
        this.onStop();
        console.log('[ServiceBase] WSClient.close(\'service shutdown\')');
        this._wsclient.close('service shutdown');
    }
    public waitAsync(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const interval = setInterval(() => {
                if (this._exit) {
                    clearInterval(interval);
                    resolve();
                }
            }, 1000);
        });

    }
    //#endregion

    //#region [ abstract ]
    abstract onStart(): void;
    abstract onStop(): void;
    abstract setupHubContract(hub: http.websocket.HubClientContract): void;
    abstract setupRestContract(rest: http.websocket.RestClientContract): void;
    //#endregion
}

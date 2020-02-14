import { RestClient } from './rest/RestClient';
import { HubClient } from './hub/HubClient';
import { HubNotification } from './hub/HubNotification';

export abstract class WSServiceBase {
    //#region [ abstract ]
    public abstract name: string;
    //#endregion

    //#region [ private ]
    private readonly _rest: RestClient;
    private readonly _hub: HubClient;
    //#endregion

    //#region [ constructor ]
    constructor(rest: RestClient, hub: HubClient) {
        this._rest = rest;
        this._hub = hub;
    }
    //#endregion

    //#region  [ protected ]
    protected request<T = void>(method: string, data: any, credentials: any, timeout?: number) {
        return this._rest.requestAsync<T>(
            {
                service: this.name,
                method,
                data,
                credentials,
            },
            timeout,
        );
    }
    protected newEvent<TCredentials, TData>(event: string) {
        return new HubNotification<TCredentials, TData>(this._hub, this.name, event);
    }
    //#endregion
}

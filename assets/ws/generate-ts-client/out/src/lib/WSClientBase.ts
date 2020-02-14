import { SimpleEventDispatcher } from 'strongly-typed-events';

import { RestClient } from './rest/RestClient';
import { HubClient } from './hub/HubClient';
import { IWSBase } from './base/IWSBase';
import { WSBase } from './base/WSBase';
import { IWSError } from './base/IWSError';

export class WSClientBase {
    //#region [ properties ]
    public readonly rest: RestClient;
    public readonly hub: HubClient;
    public readonly ws: IWSBase;
    //#endregion

    //#region  [ event ]
    public onWSError = new SimpleEventDispatcher<IWSError>();
    //#endregion

    //#region [ constructor ]
    constructor() {
        this.ws = new WSBase();
        this.hub = new HubClient(this.ws);
        this.rest = new RestClient(this.ws);
        this.ws.onNewSocketInstance.sub(() => {
            this.rest.initialize();
            this.hub.initialize();
        });
        this.ws.onConnectionChange.sub(value => {
            if (value) {
                this.hub.connect();
            }
        });

        const self = this;
        this.rest.onWSError.sub((x) => self.onWSError.dispatch(x));
        this.hub.onWSError.sub(x => self.onWSError.dispatch(x));
    }
    //#endregion
}

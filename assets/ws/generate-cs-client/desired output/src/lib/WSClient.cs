import { RestClient } from './RestClient';
import { HubClient } from './HubClient';
import { WebSocket } from './WebSocket';

export class WSClient {
    private _debug = false;

    protected rest: RestClient;
    protected hub: HubClient;
    public ws: WebSocket;

    public get debug() { return this._debug; }
    public set debug(value: boolean) {
        this._debug = value;
        this.rest.debug = value;
        this.hub.debug = value;
        this.ws.debug = value;
    }

    constructor(namespace: string) {
        this.ws = new WebSocket(namespace);
        this.hub = new HubClient(this.ws);
        this.rest = new RestClient(this.ws);
        this.ws.onInitilized.sub(() => {
            this.rest.initialize();
            this.hub.initialize();
        });
        this.ws.onConnect.sub(() => {
            this.hub.connect();
        });
    }
}

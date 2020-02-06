import { SimpleEventDispatcher, EventDispatcher } from 'strongly-typed-events';
import { WebSocket } from './WebSocket';
import { WSBase } from './WSBase';

interface IHubMessage {
    service: string;
    event: string;
    data?: any;
}

interface IHubRequest extends IHubMessage {
    credentials?: any;
    method: string;
}

interface IHubResponse extends IHubMessage {
    method: string;
    isSuccess: boolean;
    error?: string;
}

interface IHubSubscriptionsArgs {
    service: string;
    event: string;
    credentials?: any;
}

export class HubClient extends WSBase {

    //#region [ fields ]
    private requestEvent = '__hub::request__';
    private responseEvent = '__hub::response__';
    private publishEvent = '__hub::publish__';

    private _ws: WebSocket;
    private _requests: {
        [id: string]: {
            pending: boolean,
            response?: IHubResponse,
        },
    } = {};
    private _subscriptions: { [service: string]: { [event: string]: any } } = {};
    //#endregion

    //#region [ properties ]
    public debug: boolean = false;
    public defaultRequestTimeout = 3000;
    public onReceive = new SimpleEventDispatcher<IHubMessage>();
    public onSubscriptionException = new EventDispatcher<IHubSubscriptionsArgs, Error>();
    //#endregion

    //#region [ constructor ]
    constructor(client: WebSocket) {
        super('HubClient');
        this._ws = client;
    }
    //#endregion

    //#region [ public ]
    initialize() {
        this.log('initialize');
        const self = this;
        this._ws.subscribe(self.responseEvent, (response: IHubResponse) => {
            const id = self.getId(response);

            if (!self._requests[id] || !self._requests[id].pending) {
                self.error(`no request pending with id: ${id}`);
            } else {
                self._requests[id].pending = false;
                self._requests[id].response = response;
            }
        });
        this._ws.subscribe(self.publishEvent, (publication: IHubMessage) => {
            self.onReceive.dispatch(publication);
        });
    }
    connect() {
        this.requestSubscriptions();
    }
    async subscribe(service: string, event: string, credentials?: any) {
        if (!this._ws.isConnected) {
            this.registerSubscription(service, event, credentials);
            return;
        } else {
            await this.requestAsync(
                {
                    method: 'subscribe',
                    service,
                    event,
                    credentials,
                });
            this.registerSubscription(service, event, credentials);
        }
    }
    async unsubscribe(service: string, event: string) {
        if (!this._ws.isConnected) {
            this.unregisterSubscription(service, event);
            return;
        } else {
            await this.requestAsync(
                {
                    method: 'unsubscribe',
                    service,
                    event,
                });
            this.unregisterSubscription(service, event);
        }
    }
    //#endregion

    //#region [ private ]
    private getId(message: IHubRequest | IHubResponse) {
        return `#${message.method}::${message.service}.${message.event}`;
    }
    private requestAsync<T = void>(args: IHubRequest, timeout?: number): Promise<T> {
        const request = {
            method: args.method,
            service: args.service,
            event: args.event,
            credentials: args.credentials,
            data: args.data,
        } as IHubRequest;
        const id = this.getId(request);

        if (!this._requests[id]) {
            this._requests[id] = { pending: false, response: undefined };
        } else {
            if (this._requests[id].pending) {
                throw new Error('request already pending');
            }
        }
        this._requests[id].pending = true;
        this._ws.publish(this.requestEvent, request);

        return new Promise<T>(async (resolve, reject) => {
            const start = new Date().getTime();
            let time = 0;
            const validTimeout = timeout || this.defaultRequestTimeout;
            while (this._requests[id].pending && time < validTimeout) {
                await this.wait(16);
                time = new Date().getTime() - start;
            }
            if (time >= validTimeout) {
                this._requests[id].pending = false;
                reject(new Error('request timeout'));
            } else {
                this._requests[id].pending = false;
                const response = this._requests[id].response;
                if (!response) {
                    reject('impossible case. response can\'t be undefined');
                } else if (response.isSuccess) {
                    resolve(response.data as T);
                } else {
                    reject(response.error);
                }
            }
        });
    }
    //#endregion

    //#region [ subscriptions ]
    private async requestSubscriptions() {
        for (const service in this._subscriptions) {
            if (service) {
                for (const event in this._subscriptions[service]) {
                    if (event) {
                        const credentials = this._subscriptions[service][event];
                        this.log(`subscribe to '${service}.${event}( ${credentials} )'`);
                        const request = {
                            method: 'subscribe',
                            service,
                            event,
                            credentials,
                        } as IHubRequest;
                        try {
                            await this.requestAsync(request);
                        } catch (err) {
                            this.unregisterSubscription(service, event);
                            this.onSubscriptionException.dispatch(request, err);
                        }
                    }
                }
            }
        }
    }
    private registerSubscription(service: string, event: string, credentials: any) {
        if (!this._subscriptions[service]) {
            this._subscriptions[service] = {};
        }
        this._subscriptions[service][event] = credentials;
    }
    private unregisterSubscription(service: string, event: string) {
        const services = Object.keys(this._subscriptions);
        if (services.indexOf(service) != -1) {
            const events = Object.keys(this._subscriptions[service]);
            if (events.indexOf(event) != -1) {
                delete this._subscriptions[service][event];
                if (events.length == 1) {
                    delete this._subscriptions[service];
                }
            }
        }
    }
    //#endregion
}

import { SimpleEventDispatcher } from 'strongly-typed-events';

import { IWSBase } from '../base/IWSBase';

import { HubRequestQueue } from './HubRequestQueue';
import { HubSubscriptionCollection } from './HubSubscriptionCollection';
import { IHubMessage } from './messages/IHubMessage';
import { IHubRequest } from './messages/IHubRequest';
import { IHubSubscriptionError } from './types/IHubSubscriptionError';
import { IHubResponse } from './messages/IHubResponse';
import { IHubResponseError } from './types/IHubResponseError';
import { IWSError } from '../base/IWSError';

export class HubClient {

    //#region  [ constants ]
    private REQUEST_EVENT = '__hub::request__';
    private RESPONSE_EVENT = '__hub::response__';
    private PUBLISH_EVENT = '__hub::publish__';
    //#endregion

    //#region [ fields ]
    private _ws: IWSBase;
    private _requestQueue: HubRequestQueue = new HubRequestQueue();
    private _subscriptions: HubSubscriptionCollection = new HubSubscriptionCollection();
    //#endregion

    //#region [ properties ]
    public defaultRequestTimeout = 3000;
    //#endregion

    //#region [ events ]
    public onReceive = new SimpleEventDispatcher<IHubMessage>();
    public onSubscribed = new SimpleEventDispatcher<IHubRequest>();
    public onSubscriptionError = new SimpleEventDispatcher<IHubSubscriptionError>();
    public onResponseError = new SimpleEventDispatcher<IHubResponseError>();
    public onWSError = new SimpleEventDispatcher<IWSError>();
    //#endregion

    //#region [ constructor ]
    constructor(ws: IWSBase) {
        this._ws = ws;
    }
    //#endregion

    //#region [ public ]
    initialize() {
        const self = this;
        this._ws
            .subscribe(self.RESPONSE_EVENT, (res: IHubResponse) => {
                if (!self._requestQueue.contains(res) || self._requestQueue.isDone(res)) {
                    const error = `error with id = ${self._requestQueue.getId(res)}. not exists or is done`;
                    this.onResponseError.dispatch({ response: res, error });
                } else {
                    self._requestQueue.receive(res);
                }
            })
            .subscribe(self.PUBLISH_EVENT, (publication: IHubMessage) => {
                self.onReceive.dispatch(publication);
            });
    }
    connect() {
        this.requestExistingSubscriptions();
    }
    async subscribe(service: string, event: string, credentials?: any) {
        const subRequest = {
            service,
            eventName: event,
            credentials,
            method: 'subscribe',
        } as IHubRequest;

        if (!this._ws.isConnected) {
            if (this._subscriptions.contains(subRequest)) {
                this._subscriptions.update(subRequest);
            } else {
                this._subscriptions.add(subRequest);
            }
            return;
        }

        if (this._subscriptions.contains(subRequest)) {
            this._subscriptions.remove(subRequest);
        }

        await this.requestAsync(subRequest);
        this._subscriptions.add(subRequest);
        this.onSubscribed.dispatch(subRequest);
    }
    async unsubscribe(service: string, event: string) {
        const unsubRequest = {
            service,
            eventName: event,
            method: 'unsubscribe',
        } as IHubRequest;

        if (!this._subscriptions.contains(unsubRequest)) {
            throw new Error('subscription not found');
        }

        if (!this._ws.isConnected) {
            this._subscriptions.remove(unsubRequest);
            return;
        }

        await this.requestAsync(unsubRequest);
        this._subscriptions.remove(unsubRequest);
    }
    //#endregion

    //#region [ private ]
    private async requestAsync<T = void>(req: IHubRequest, timeout?: number): Promise<T> {
        if (!this._ws.isConnected) {
            throw new Error('ws is not connected');
        }

        if (this._requestQueue.contains(req)) {
            throw new Error(`RequestQueue already contains request id ${this._requestQueue.getId(req)}`);
        }

        this._requestQueue.add(req);
        this._ws.publish(this.REQUEST_EVENT, req);

        const timeoutSpan = !timeout || timeout == 0
            ? this.defaultRequestTimeout
            : timeout;

        const startTime = new Date().getTime();
        let time = 0;

        while (!this._requestQueue.isDone(req) && time < timeoutSpan) {
            await this.wait(16);
            time = new Date().getTime() - startTime;
        }

        const response = this._requestQueue.dequeue(req);

        if (time >= timeoutSpan) {
            throw new Error(`timeout. elapsed time = ${time} millis`);
        }

        if (!response.isSuccess) {
            if (response.error) {
                this.onWSError.dispatch(response.error);
                throw new Error(response.error.message);
            } else {
                throw new Error('undefined error');
            }
        }

        return response.data;
    }
    private async requestExistingSubscriptions() {
        const requests = this._subscriptions.list().concat();
        for (const req of requests) {
            if (req) {
                try {
                    await this.subscribe(req.service, req.eventName, req.credentials);
                } catch (err) {
                    this._subscriptions.remove(req);
                    this.onSubscriptionError.dispatch({ request: req, error: err });
                }
            }
        }
    }
    private wait(millis: number = 1000): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => { resolve(); }, millis);
        });
    }
    //#endregion
}

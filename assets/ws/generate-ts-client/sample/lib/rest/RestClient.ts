import { SimpleEventDispatcher } from 'strongly-typed-events';

import { IWSBase } from '../base/IWSBase';

import { RestRequestQueue } from './RestRequestQueue';
import { IRestResponse } from './messages/IRestResponse';
import { IRestResponseError } from './types/IRestResponseError';
import { IRestRequest } from './messages/IRestRequest';
import { IWSError } from '../base/IWSError';

export class RestClient {
    //#region  [ constants ]
    private REQUEST_EVENT = '__rest::request__';
    private RESPONSE_EVENT = '__rest::response__';
    //#endregion

    //#region [ fields ]
    private _ws: IWSBase;
    private _requestQueue: RestRequestQueue = new RestRequestQueue();
    //#endregion

    //#region [ properties ]
    public defaultRequestTimeout = 3000;
    //#endregion

    //#region [events]
    public onResponseError = new SimpleEventDispatcher<IRestResponseError>();
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
        this._ws.subscribe(this.RESPONSE_EVENT, (res: IRestResponse) => {
            if (!self._requestQueue.contains(res) || self._requestQueue.isDone(res)) {
                const error = `error with id = ${self._requestQueue.getId(res)}. not exists or is done`;
                this.onResponseError.dispatch({ response: res, error });
            } else {
                self._requestQueue.receive(res);
            }
        });
    }
    public async requestAsync<T = void>(req: IRestRequest, timeout?: number): Promise<T> {
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
    //#endregion

    //#region [ private ]
    private wait(millis: number = 1000): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => { resolve(); }, millis);
        });
    }
    //#endregion
}

import { WebSocket } from './WebSocket';
import { WSBase } from './WSBase';

interface IRestMessage {
    service: string;
    method: string;
    data?: any;
}
interface IRestRequest extends IRestMessage {
    credentials: any;
}

interface IRestResponse extends IRestMessage {
    isSuccess: boolean;
    error?: string;
}

export class RestClient extends WSBase {
    //#region [ fields ]
    private requestEvent = '__rest::request__';
    private requestResponse = '__rest::response__';

    private _ws: WebSocket;
    private requests: {
        [id: string]: {
            pending: boolean,
            response?: IRestResponse,
        },
    } = {};
    //#endregion

    //#region [ properties ]
    public debug: boolean = false;
    public defaultRequestTimeout = 3000;
    //#endregion

    //#region [ constructor ]
    constructor(ws: WebSocket) {
        super('RestClient');
        this._ws = ws;
    }
    //#endregion

    //#region [ public ]
    initialize() {
        this.log('initialize');

        const self = this;
        this._ws.subscribe(this.requestResponse, (response: IRestResponse) => {
            const id = this.getId(response);

            if (!self.requests[id] || !self.requests[id].pending) {
                self.error(`no request pending with id: ${id}`);
            } else {
                this.requests[id].pending = false;
                self.requests[id].response = response;
            }
        });
    }
    public async requestAsync<T = void>(args: { service: string, method: string, data?: any, timeout?: number, credentials?: any }): Promise<T> {
        if (!this._ws.isConnected) { throw new Error('socket not connected'); }

        const request = {
            service: args.service,
            method: args.method,
            data: args.data,
            credentials: args.credentials,
        } as IRestRequest;
        const id = this.getId(request);

        if (!this.requests[id]) {
            this.requests[id] = { pending: false, response: undefined };
        } else {
            if (this.requests[id].pending) {
                throw new Error('request already pending');
            }
        }
        this.requests[id].pending = true;
        this._ws.publish(this.requestEvent, request);

        return new Promise<T>(async (resolve, reject) => {
            const start = new Date().getTime();
            let time = 0;
            const timeout = args.timeout || this.defaultRequestTimeout;
            while (this.requests[id].pending && time < timeout) {
                await this.wait(16);
                time = new Date().getTime() - start;
            }
            if (time >= timeout) {
                this.requests[id].pending = false;
                reject(new Error('request timeout'));
            } else {
                this.requests[id].pending = false;
                const response = this.requests[id].response;
                if (!response) {
                    reject('impossible case. response can\'t be undefined');
                } else if (response.isSuccess) {
                    resolve(response.data);
                } else {
                    reject(response.error);
                }
            }
        });
    }

    //#region [ private ]
    private getId(message: IRestMessage) {
        return `#${message.service}.${message.method}`;
    }
    //#endregion
}

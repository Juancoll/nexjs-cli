import { IRestResponse } from './messages/IRestResponse';
import { IRestMessage } from './messages/IRestMessage';

interface IRequest {
    done: boolean;
    response?: IRestResponse;
}

export class RestRequestQueue {
    //#region  [ fields ]
    private _requests: { [id: string]: IRequest } = {};
    //#endregion

    //#region [ public ]
    public getId(msg: IRestMessage): string {
        return `#${msg.service}.${msg.method}`;
    }
    public contains(msg: IRestMessage): boolean {
        return this._requests[this.getId(msg)] ? true : false;
    }
    public add(msg: IRestMessage): void {
        const id = this.getId(msg);
        if (this._requests[id]) {
            throw new Error(`[RequestQueue] already exists id ${id}`);
        }

        this._requests[id] = {
            done: false,
            response: undefined,
        };
    }
    public isDone(msg: IRestMessage): boolean {
        const id = this.getId(msg);
        if (!this._requests[id]) {
            throw new Error(`[RequestQueue] not contains id ${id}`);
        }

        return this._requests[id].done;
    }
    public receive(msg: IRestResponse): void {
        const id = this.getId(msg);
        if (!this._requests[id]) {
            throw new Error(`[RequestQueue] not contains id ${id}`);
        }

        this._requests[id].done = true;
        this._requests[id].response = msg;
    }
    public dequeue(msg: IRestMessage): IRestResponse {
        const id = this.getId(msg);
        if (!this._requests[id]) {
            throw new Error(`[RequestQueue] not contains id ${id}`);
        }

        const response = this._requests[id].response;
        if (!response) {
            throw new Error(`[RequestQueue] can't dequeue because response is not done`);
        }
        delete this._requests[id];
        return response;
    }
    //#endregion
}

import { IHubResponse } from './messages/IHubResponse';
import { IHubRestMessage } from './messages/IHubRestMessage';

interface IRequest {
    done: boolean;
    response?: IHubResponse;
}

export class HubRequestQueue {
    //#region  [ fields ]
    private _requests: { [id: string]: IRequest } = {};
    //#endregion

    //#region [ public ]
    public getId(msg: IHubRestMessage): string {
        return `#${msg.method}:${msg.service}.${msg.eventName}`;
    }
    public contains(msg: IHubRestMessage): boolean {
        return this._requests[this.getId(msg)] ? true : false;
    }
    public add(msg: IHubRestMessage): void {
        const id = this.getId(msg);
        if (this._requests[id]) {
            throw new Error(`[RequestQueue] already exists id ${id}`);
        }

        this._requests[id] = {
            done: false,
            response: undefined,
        };
    }
    public isDone(msg: IHubRestMessage): boolean {
        const id = this.getId(msg);
        if (!this._requests[id]) {
            throw new Error(`[RequestQueue] not contains id ${id}`);
        }

        return this._requests[id].done;
    }
    public receive(msg: IHubResponse): void {
        const id = this.getId(msg);
        if (!this._requests[id]) {
            throw new Error(`[RequestQueue] not contains id ${id}`);
        }

        this._requests[id].done = true;
        this._requests[id].response = msg;
    }
    public dequeue(msg: IHubRestMessage): IHubResponse {
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

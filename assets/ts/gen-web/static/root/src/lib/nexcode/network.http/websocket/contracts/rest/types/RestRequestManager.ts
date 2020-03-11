import * as Collection from 'typescript-collections';
import { EventDispatcher } from 'strongly-typed-events';

import { IRestMessage } from './IRestMessage';
import { IRestResponse } from '../../../../rest/interfaces/IRestResponse';

export interface IRequest {
    request: IRestMessage;
    isDone: boolean;
    response: IRestResponse | undefined;
}

export class RestRequestManager {

    // [ events ]
    public onResponse = new EventDispatcher<RestRequestManager, IRequest>();

    // [ fields ]
    private _requests = new Collection.Dictionary<string, IRequest>();

    // [ public methods ]
    public register(requestMsg: IRestMessage) {
        this._requests.setValue(requestMsg.uid, {
            request: requestMsg,
            isDone: false,
        } as IRequest);
    }
    public isDone(requestMsg: IRestMessage): boolean {
        const request = this._requests.getValue(requestMsg.uid);
        if (!request) {
            throw new Error(`request ${requestMsg.uid} not found`);
        }

        return request.isDone;
    }
    public getResponse(requestMsg: IRestMessage): IRestResponse | undefined {
        const request = this._requests.getValue(requestMsg.uid);
        if (!request) {
            throw new Error(`request ${requestMsg.uid} not found`);
        }
        return request.response;
    }
    public setResponse(responseMsg: IRestMessage) {
        if (this._requests.containsKey(responseMsg.uid)) {
            const request = this._requests.getValue(responseMsg.uid);
            if (!request) {
                throw new Error(`request ${responseMsg.uid} not found`);
            }
            request.response = responseMsg.data;
            request.isDone = true;
            this.onResponse.dispatch(this, request);
        }
    }
    public unregister(requestMsg: IRestMessage) {
        this._requests.remove(requestMsg.uid);
    }
}

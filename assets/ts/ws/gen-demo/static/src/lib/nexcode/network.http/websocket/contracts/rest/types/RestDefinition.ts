import * as Collection from 'typescript-collections';
import * as linq from 'linq';
import { SimpleEventDispatcher } from 'strongly-typed-events';

import { IRestRouteDescription } from '../../../../rest/interfaces/IRestRouteDescription';
import { IRestContractDescription } from './IRestContractDescription';
import { IRestResponse } from '../../../../rest';

interface IRequest {
    route: string;
    description: any;
    func: (data: any) => IRestResponse;
}
interface IRequestAsync {
    route: string;
    description: any;
    func: (data: any) => Promise<IRestResponse>;
}
export class RestDefinition {

    // [ events ]
    public onDefineRequest = new SimpleEventDispatcher<IRestContractDescription>();

    // [ fields ]
    private _name: string;
    private _description: string;
    private _requests = new Collection.Dictionary<string, IRequest>();
    private _requestsAsync = new Collection.Dictionary<string, IRequestAsync>();

    // [ properties ]
    public get description(): IRestContractDescription {

        const fromRequests = linq.from(this._requests.values());
        const descriptions = fromRequests
            .select((x, idx) => {
                return {
                    route: x.route,
                    description: x.description,
                } as IRestRouteDescription;
            })
            .orderBy((x) => x.route)
            .toArray();

        const fromRequestsAsync = linq.from(this._requestsAsync.values());
        const descriptionsAsync = fromRequestsAsync
            .select((x, idx) => {
                return {
                    route: x.route,
                    description: x.description,
                } as IRestRouteDescription;
            })
            .orderBy(x => x.route)
            .toArray();

        const merge = descriptions.concat(descriptionsAsync);

        return {
            name: this._name,
            description: this._description,
            requests: merge,
        } as IRestContractDescription;
    }

    // [ constructor ]
    constructor(name: string, description: string) {
        this._name = name;
        this._description = description;
    }

    // [ public methods ]
    public on(request: string, description: any, func: (data: any) => IRestResponse): RestDefinition {
        if (this._requestsAsync.containsKey(this._name + request)) {
            throw new Error(`Service ${this._name + request} already defined`);
        }

        this._requests.setValue(this._name + request, {
            route: request,
            description,
            func,
        } as IRequest);

        this.onDefineRequest.dispatch({
            name: this._name,
            description: this._description,
            requests: [{
                route: request,
                description,
            } as IRestRouteDescription],
        } as IRestContractDescription);

        return this;
    }
    public execute(request: string, data: any): IRestResponse {
        const found = this._requests.getValue(this._name + request);

        if (!found) {
            throw new Error(`Request ${this._name + request} not found`);
        }

        return found.func(data);
    }
    public contains(request: string): boolean {
        return this._requests.containsKey(this._name + request);
    }

    // [ public methods Async ]
    public onAsync(request: string, description: any, func: (data: any) => Promise<IRestResponse>): RestDefinition {
        if (this._requests.containsKey(this._name + request)) {
            throw new Error(`Service ${request} already defined`);
        }

        this._requestsAsync.setValue(this._name + request, {
            route: request,
            description,
            func,
        } as IRequestAsync);

        this.onDefineRequest.dispatch({
            name: this._name,
            description: this._description,
            requests: [{
                route: request,
                description,
            } as IRestRouteDescription],
        } as IRestContractDescription);

        return this;
    }
    public executeAsync(request: string, data: any): Promise<IRestResponse> {
        const found = this._requestsAsync.getValue(this._name + request);
        if (!found) {
            throw new Error(`Request ${this._name + request} not found`);
        }
        return found.func(data);
    }
    public containsAsync(request: string): boolean {
        return this._requestsAsync.containsKey(this._name + request);
    }
}

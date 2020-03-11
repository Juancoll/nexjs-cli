import * as Collection from 'typescript-collections';
import * as linq from 'linq';
import { v1 } from 'uuid';

import { ExceptionEventArgs } from '@/lib/nexcode/types';
import { DelayAsync } from '@/lib/nexcode/types';

import { IRestMessage } from './types/IRestMessage';
import { ClientContractBase } from '../base/ClientContractBase';
import { RestDefinition } from './types/RestDefinition';
import { RestRequestManager } from './types/RestRequestManager';
import { IWSClient } from '../../client/IWSClient';
import { IWSConnectionContext } from '../../types/IWSConnectionContext';
import { WSConnectionCloseEventArgs } from '../../types/WSConnectionCloseEventArgs';
import { IRestResponse } from '../../../rest/interfaces/IRestResponse';
import { IRestContractDescription } from './types/IRestContractDescription';

export class RestClientContract extends ClientContractBase {
    public static requestTimeout: number = 20000;
    // [ message factory ]
    private getServiceDescriptionMessage(descriptions: IRestContractDescription[]): IRestMessage {
        return {
            uid: v1(),
            contract: this.contractName,
            type: 'internal',
            request: 'register',
            data: descriptions,
        } as IRestMessage;
    }
    private getResponseMessage(requestMsg: IRestMessage, response: any): IRestMessage {
        return {
            contract: this.contractName,
            uid: requestMsg.uid,
            type: 'response',
            service: requestMsg.service,
            request: requestMsg.request,
            data: response,
        } as IRestMessage;
    }
    private getRequestMessage(service: string, request: string, data: any): IRestMessage {
        return {
            contract: this.contractName,
            type: 'request',
            uid: v1(),
            service,
            request,
            data,
        } as IRestMessage;
    }

    // [ field ]
    private _serviceDefinitions = new Collection.Dictionary<string, RestDefinition>();
    private _requests = new RestRequestManager();

    // [ ClientContractBase ]
    public get contractName(): string {
        return 'rest';
    }
    protected _onSetClient(client: IWSClient): void { /* empty */ }
    protected _onOpen(context: IWSConnectionContext): void {
        if (!this.client) {
            throw new Error('client is null');
        }

        if (this._serviceDefinitions.size() != 0) {
            const descriptions = linq.from(this._serviceDefinitions.values()).select((x) => x.description).toArray();
            this.client.send(JSON.stringify(this.getServiceDescriptionMessage(descriptions)));
        } else {
            this.client.send(JSON.stringify(this.getServiceDescriptionMessage([])));
        }
    }
    protected _onClose(e: WSConnectionCloseEventArgs): void {
        // this._serviceDefinitions.clear();
    }
    protected _onError(e: ExceptionEventArgs): void { /* empty */ }
    protected _onReceive(msg: string, json: any): void {
        const srvMsg = json as IRestMessage;
        if (!this.client) {
            throw new Error('client is null');
        }

        switch (srvMsg.type) {
            case 'request':
                const restService = this._serviceDefinitions.getValue(srvMsg.service);
                if (!restService) {
                    return;
                }

                if (restService.contains(srvMsg.request)) {
                    const response = restService.execute(srvMsg.request, srvMsg.data);
                    this.client.send(JSON.stringify(this.getResponseMessage(srvMsg, response)));
                }
                if (restService.containsAsync(srvMsg.request)) {
                    restService.executeAsync(srvMsg.request, srvMsg.data)
                        .then(response => {
                            if (!this.client) {
                                throw new Error('client is null');
                            }
                            this.client.send(JSON.stringify(this.getResponseMessage(srvMsg, response)));
                        });
                }
                break;
            case 'response':
                this._requests.setResponse(srvMsg);
                break;
        }
    }

    // [ public methods ]
    public define(name: string, description: string): RestDefinition {
        if (!this._serviceDefinitions.containsKey(name)) {
            const def = new RestDefinition(name, description);
            this._serviceDefinitions.setValue(name, def);
            def.onDefineRequest.subscribe((desc) => {
                if (!this.client) {
                    throw new Error('client is null');
                }

                if (this.client.isOpened) {
                    this.client.send(JSON.stringify(this.getServiceDescriptionMessage([desc])));
                }
            });
        }

        const result = this._serviceDefinitions.getValue(name);
        if (!result) {
            throw new Error('can\'t append');
        }
        return result;
    }
    public async requestAsync(service: string, request: string, data?: any): Promise<IRestResponse> {
        if (!this.client) {
            throw new Error('client is null');
        }

        const msg = this.getRequestMessage(service, request, data = typeof data == 'undefined' ? null : data);
        this._requests.register(msg);
        this.client.send(JSON.stringify(msg));

        return new Promise<IRestResponse>(async (resolve, reject) => {
            const start = new Date();
            const time = 0;
            while (!this._requests.isDone(msg) && time < RestClientContract.requestTimeout) {
                await new DelayAsync().start(16);
                // time = new Date().getTime() - start.getTime();
            }
            if (time >= RestClientContract.requestTimeout) {
                resolve({
                    isSuccess: false,
                    data: null,
                    error: 'timeout',
                } as IRestResponse);
            } else {
                const response = this._requests.getResponse(msg);
                this._requests.unregister(msg);
                resolve(response);
            }
        });
    }
    public request(service: string, request: string, data: any, action: (res: IRestResponse) => void): void {
        if (!this.client) {
            throw new Error('client is null');
        }

        const msg = this.getRequestMessage(service, request, data);
        this._requests.register(msg);
        this.client.send(JSON.stringify(msg));

        const start = new Date();
        let time = 0;
        const interval = setInterval(() => {
            time = new Date().getTime() - start.getTime();
            if (time >= RestClientContract.requestTimeout) {
                clearInterval(interval);
                return {
                    isSuccess: false,
                    data: null,
                    error: 'timeout',
                } as IRestResponse;
            }
            if (this._requests.isDone(msg)) {
                clearInterval(interval);
                const response = this._requests.getResponse(msg);
                this._requests.unregister(msg);
                return response;
            }
        }, 16);
    }
}

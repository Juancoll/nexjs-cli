import { v1 } from 'uuid';
import * as Collection from 'typescript-collections';

import { ExceptionEventArgs } from '@/lib/nexcode/types';

import { ClientContractBase } from '../base/ClientContractBase';
import { IWSClient } from '../../client/IWSClient';
import { IWSConnectionContext } from '../../types/IWSConnectionContext';
import { WSConnectionCloseEventArgs } from '../../types/WSConnectionCloseEventArgs';
import { IHubMessage } from './types/IHubMessage';
import { IHubMessageDescription } from './types/HubMessageDescription';
import { HubSubscription } from './types/HubSubscription';

class State {
    public subscriptionsByChannel = new Collection.Dictionary<string, HubSubscription>();
    public publications = new Array<IHubMessageDescription>();
    public subscriptions = new Array<IHubMessageDescription>();
}

// tslint:disable-next-line: max-classes-per-file
export class HubClientContract extends ClientContractBase {

    // [ message factory ]
    private getSubscribeMsg(channel: string): IHubMessage {

        const msg = {
            uid: v1(),
            contract: this.contractName,
            channel: 'internal',
            type: 'subscribe',
            data: channel,
        } as IHubMessage;
        return msg;
    }
    private getUnsubscribeMsg(channel: string): IHubMessage {
        const msg = {
            uid: v1(),
            contract: this.contractName,
            channel: 'internal',
            type: 'unsubscribe',
            data: channel,
        } as IHubMessage;
        return msg;
    }
    private getPublicationsMessage(publications: IHubMessageDescription[]): IHubMessage {
        const msg = {
            uid: v1(),
            contract: this.contractName,
            channel: 'internal',
            type: 'publications',
            data: publications,
        } as IHubMessage;
        return msg;
    }
    private GetSubscriptionMessage(subscriptions: IHubMessageDescription[]): IHubMessage {
        const msg = {
            uid: v1(),
            contract: this.contractName,
            channel: 'internal',
            type: 'subscriptions',
            data: subscriptions,
        } as IHubMessage;
        return msg;
    }

    // [ field ]
    private _state: State = new State();

    // [ properties ]
    public get publications(): IHubMessageDescription[] {
        return this._state.publications;
    }
    public get subscriptions(): IHubMessageDescription[] {
        return this._state.subscriptions;
    }
    public get subscribedChannels(): string[] {
        return this._state.subscriptionsByChannel.keys();
    }

    // [ ClientContractBase ]
    public get contractName(): string {
        return 'hub';
    }
    protected _onOpen(context: IWSConnectionContext): void {

        this._state.subscriptionsByChannel.keys().forEach(channel => {
            if (this.client) {
                this.client.send(JSON.stringify(this.getSubscribeMsg(channel)));
            }
        });

        if (!this.client) {
            return;
        }

        if (this.publications.length > 0) {
            this.client.send(JSON.stringify(this.getPublicationsMessage(this.publications)));
        }

        if (this.subscriptions.length > 0) {
            this.client.send(JSON.stringify(this.GetSubscriptionMessage(this.subscriptions)));
        }
    }
    protected _onReceive(msg: string, json: any): void {
        const hubMsg = json as IHubMessage;
        if (this._state.subscriptionsByChannel.containsKey(hubMsg.channel)) {
            const sub = this._state.subscriptionsByChannel.getValue(hubMsg.channel);
            if (sub) {
                sub._dispatch(hubMsg);
            }
        }
    }
    protected _onClose(e: WSConnectionCloseEventArgs): void { /* empty */ }
    protected _onError(e: ExceptionEventArgs): void { /* empty */ }
    protected _onSetClient(client: IWSClient): void { /* empty */ }

    // [ Pub/Sub pattern ]
    public subscribe(channel: string): HubSubscription {
        if (!this.client) {
            throw new Error('client is null');
        }

        if (!this._state.subscriptionsByChannel.containsKey(channel)) {
            this._state.subscriptionsByChannel.setValue(channel, new HubSubscription(channel));
        }

        if (this.client.isOpened) {
            this.client.send(JSON.stringify(this.getSubscribeMsg(channel)));
        }

        const subscription = this._state.subscriptionsByChannel.getValue(channel);
        if (!subscription) {
            throw new Error('no subscription found');
        }

        return subscription;
    }
    public unsubscribe(channel: string): HubClientContract {
        if (!this.client) {
            throw new Error('client is null');
        }

        if (!this._state.subscriptionsByChannel.containsKey(channel)) {
            throw new Error(`Channel ${channel} isn't subscribed`);
        }

        this._state.subscriptionsByChannel.remove(channel);

        if (this.client.isOpened) {
            this.client.send(JSON.stringify(this.getUnsubscribeMsg(channel)));
        }

        return this;
    }
    public publishToMe(channel: string, type: string, data: any = null): HubClientContract {
        const hubMsg = {
            contract: this.contractName,
            channel,
            type,
            data,
        } as IHubMessage;
        if (this._state.subscriptionsByChannel.containsKey(hubMsg.channel)) {
            const sub = this._state.subscriptionsByChannel.getValue(hubMsg.channel);
            if (sub) {
                sub._dispatch(hubMsg);
            }
        }
        return this;
    }
    public publish(channel: string, type: string, data: any = null): HubClientContract {
        if (!this.client) {
            throw new Error('client is null');
        }

        const msg = {
            contract: this.contractName,
            channel,
            type,
            data,
        } as IHubMessage;

        this.client.send(JSON.stringify(msg));
        return this;
    }
    public addPublishDescription(channel: string, type: string, description: any): HubClientContract {
        if (!this.client) {
            throw new Error('client is null');
        }
        const item = { channel, type, description } as IHubMessageDescription;
        this._state.publications.push(item);
        if (this.client.isOpened) {
            const arg = new Array<IHubMessageDescription>();
            arg.push(item);
            this.client.send(JSON.stringify(this.getPublicationsMessage(arg)));
        }
        return this;
    }
    public addSubscribeDescription(channel: string, type: string, description: any): HubClientContract {
        if (!this.client) {
            throw new Error('client is null');
        }
        const item = { channel, type, description } as IHubMessageDescription;
        this._state.subscriptions.push(item);
        if (this.client.isOpened) {
            const arg = new Array<IHubMessageDescription>();
            arg.push(item);
            this.client.send(JSON.stringify(this.GetSubscriptionMessage(arg)));
        }
        return this;
    }
}

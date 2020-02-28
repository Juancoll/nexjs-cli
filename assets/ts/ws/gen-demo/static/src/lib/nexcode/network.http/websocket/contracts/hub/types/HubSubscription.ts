import * as Collection from 'typescript-collections';
import { ExceptionEventArgs } from '@/lib/nexcode/types';

import { IHubMessage } from './IHubMessage';

export class HubSubscription {

    // [ fields ]
    private _onActions = new Array<(type: string, data: any) => void>();
    private _onActionsByType = new Collection.Dictionary<string, Array<(data: any) => void>>();
    private _onErrorActions = new Array<(e: ExceptionEventArgs) => void>();

    // [ properties ]
    public channel: string;

    // [ constructor ]
    constructor(channel: string) {
        this.channel = channel;
    }

    // [ public ]

    public on(type: string, action: (data: any) => void): HubSubscription;
    public on(action: (type: string, data: any) => void): HubSubscription;
    public on(typeOrAction: string | ((type: string, data: any) => void), action?: (data: any) => void): HubSubscription {
        if (typeof typeOrAction === 'string') {
            if (!this._onActionsByType.containsKey(typeOrAction)) {
                this._onActionsByType.setValue(typeOrAction, new Array<(data: any) => void>());
            }

            if (!action) {
                throw new Error('action is required');
            }

            const collection = this._onActionsByType.getValue(typeOrAction);
            if (!collection) {
                throw new Error('can\'t appends');
            }
            collection.push(action);
        } else {
            this._onActions.push(typeOrAction);
        }
        return this;
    }
    public onerror(action: (e: ExceptionEventArgs) => void): HubSubscription {
        this._onErrorActions.push(action);
        return this;
    }

    // [ private ]
    private callOnErrorActions(e: ExceptionEventArgs) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this._onErrorActions.length; i++) {
            try {
                this._onErrorActions[i](e);
            } catch (error) {
                console.error(error);
            }
        }
    }
    private callOnActions(msg: IHubMessage) {
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < this._onActions.length; i++) {
            try {
                this._onActions[i](msg.type, msg.data);
            } catch (error) {
                this.callOnErrorActions(new ExceptionEventArgs(error));
            }
        }
    }
    private callOnActionsByType(msg: IHubMessage) {
        if (!this._onActionsByType.containsKey(msg.type)) {
            return;
        }

        const actions = this._onActionsByType.getValue(msg.type);
        if (!actions) {
            throw new Error('no actions found');
        }

        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < actions.length; i++) {
            try {
                const action = actions[i];
                action(msg.data);
            } catch (error) {
                this.callOnErrorActions(new ExceptionEventArgs(error));
            }
        }
    }

    public _dispatch(msg: IHubMessage) {
        if (msg.channel != this.channel) {
            return;
        }

        this.callOnActions(msg);
        this.callOnActionsByType(msg);
    }
}

import { SimpleEventDispatcher } from 'strongly-typed-events';

import { HubClient } from '../HubClient';

export class HubNotification {
    //#region [ fields ]
    private _hub: HubClient;
    private _actions: Array<() => void | Promise<void>> = [];
    //#endregion

    //#region [ properties ]
    public service: string;
    public event: string;
    public onError = new SimpleEventDispatcher<Error>();
    //#endregion
    constructor(hub: HubClient, service: string, event: string) {
        this._hub = hub;
        this.service = service;
        this.event = event;
        hub.onReceive.sub(async publication => {
            if (publication.service == service && publication.eventName == event) {
                for (const action of this._actions) {
                    if (action) {
                        try {
                            const result = action();
                            if ((result as any).then) {
                                await result;
                            }
                        } catch (err) {
                            this.onError.dispatch(err);
                        }
                    }
                }
            }
        });
    }

    on(action: () => void | Promise<void>): HubNotification {
        this._actions.push(action);
        return this;
    }
    off(): HubNotification {
        this._actions = [];
        return this;
    }
    subscribe() {
        return this._hub.subscribe(this.service, this.event, null);
    }
    unsubscribe() {
        return this._hub.unsubscribe(this.service, this.event);
    }

    sub() {
        return this.subscribe();
    }
    unsub() {
        return this.unsubscribe();
    }
}

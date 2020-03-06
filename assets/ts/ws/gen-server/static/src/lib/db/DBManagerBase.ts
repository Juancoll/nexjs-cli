import { IAuthUser } from '@/models';

import { DBProviderBase } from './providers/DBProviderBase';
import { SimpleEventDispatcher, EventDispatcher } from 'strongly-typed-events';
import { IAuthRepository } from './IAuthRepository';

export abstract class DBManagerBase implements IAuthRepository {

    //#region [ fields ]
    private _providers: { [key: string]: DBProviderBase<any> } = {};
    //#endregion

    //#region  [ events ]
    onError = new EventDispatcher<DBProviderBase<any>, any>();
    onConnected = new SimpleEventDispatcher<DBProviderBase<any>>();
    onReconnecting = new SimpleEventDispatcher<DBProviderBase<any>>();
    onReconnected = new SimpleEventDispatcher<DBProviderBase<any>>();
    onDisconnected = new SimpleEventDispatcher<DBProviderBase<any>>();
    onHostsChange = new EventDispatcher<DBProviderBase<any>, string[]>();
    //#endregion

    constructor(key: string, private authProvider: IAuthRepository & DBProviderBase<any>) {
        this.register(key, authProvider);
    }

    //#region  [ IAuthRepository ]
    createUser(email: string, encryptedPassword: string): Promise<IAuthUser> {
        return this.authProvider.createUser(email, encryptedPassword);
    }
    getUserByEmail(email: string): Promise<IAuthUser | null> {
        return this.authProvider.getUserByEmail(email);
    }
    //#endregion

    //#region  [ public ]
    public register(key: string, provider: DBProviderBase<any>) {
        this._providers[key] = provider;

        provider.manager = this;

        provider.onConnected.sub(() => this.onConnected.dispatch(provider));
        provider.onDisconnected.sub(() => this.onDisconnected.dispatch(provider));
        provider.onReconnecting.sub(() => this.onReconnecting.dispatch(provider));
        provider.onReconnected.sub(() => this.onReconnected.dispatch(provider));
        provider.onHostsChange.sub((hosts) => this.onHostsChange.dispatch(provider, hosts));

        provider.onError.sub(err => this.onError.dispatch(provider, err));

    }

    public get<T extends DBProviderBase<any>>(key: string): T {
        if (!this._providers[key]) {
            throw new Error(`db provider ${key} not found`);
        }
        return this._providers[key] as T;
    }
    async connect(): Promise<void> {

        for (const property in this._providers) {
            if (property) {
                await this._providers[property].connect();
            }
        }
    }
    //#endregion
}

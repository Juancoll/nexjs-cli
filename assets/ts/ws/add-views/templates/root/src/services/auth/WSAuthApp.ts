import { SimpleEventDispatcher } from 'strongly-typed-events';
import { IAuthApp, IAuthUser, LocalStorageRepository } from '@/lib/auth';
import { env } from '@/services/env';

import { lib } from '{{&name}}';

export class WSAuthApp implements IAuthApp {
    private _wsapi: lib.WSApiBase<any, any>;
    private _repo = new LocalStorageRepository('authapp', true);

    constructor(wsapi: lib.WSApiBase<any, any>) {
        this._wsapi = wsapi;
        this._wsapi.auth.onAuthenticateChange.sub(value => {
            this.onAuthenticate.dispatch(this._wsapi.auth.authInfo ? this._wsapi.auth.authInfo.user : undefined);

            if (this._wsapi.auth.authInfo) {
                this._repo.save(this._wsapi.auth.authInfo.token);
            } else {
                this._repo.clear();
            }
        });

        const token = this._repo.open();
        if (token) {
            this.authenticate(token);
        }
    }

    public get isAuth(): boolean { return this._wsapi.auth.authInfo ? true : false; }
    public get user(): IAuthUser | undefined | null { return this._wsapi.auth.authInfo ? this._wsapi.auth.authInfo.user : undefined; }
    public readonly onAuthenticate = new SimpleEventDispatcher<IAuthUser | null>();

    public async register(data: any): Promise<IAuthUser> {
        if (!this._wsapi.ws.isConnected) {
            await this._wsapi.ws.connectAsync(env.vars.wsapi.url, env.vars.wsapi.path, env.vars.wsapi.nsp);
        }
        const res = await this._wsapi.auth.register(data);
        return res.user;
    }
    public async login(data: any): Promise<IAuthUser> {
        if (!this._wsapi.ws.isConnected) {
            await this._wsapi.ws.connectAsync(env.vars.wsapi.url, env.vars.wsapi.path, env.vars.wsapi.nsp);
        }
        const res = await this._wsapi.auth.login(data);
        return res.user;
    }
    public async logout(): Promise<void> {
        await this._wsapi.auth.logout();
        this._wsapi.ws.disconnect();
    }

    private async authenticate(token: any): Promise<void> {
        if (!this._wsapi.ws.isConnected) {
            await this._wsapi.ws.connectAsync(env.vars.wsapi.url, env.vars.wsapi.path, env.vars.wsapi.nsp);
        }
        await this._wsapi.auth.authenticate(token);
    }
}

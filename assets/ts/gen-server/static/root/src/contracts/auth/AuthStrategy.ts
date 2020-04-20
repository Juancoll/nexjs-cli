import { Injectable } from '@nestjs/common';
import { User, Player } from '@/models/main';
import { IAuthStrategy, IAuthInfo, ISocketClient } from '@nexjs/wsserver';
import { PlayerAuthProvider } from './providers/PlayerAuthProvider';
import { UserAuthProvider } from './providers/UserAuthProvider';

export type IUser = Player | User;
export interface IToken { provider: string; value: string; }

@Injectable()
export class AuthStrategy implements IAuthStrategy<IUser, IToken> {

    //#region [ fields ]
    private _providerByClientId: { [id: string]: 'user' | 'player' } = {};
    //#endregion

    //#region [ properties ]
    public providers: {
        user: UserAuthProvider;
        player: PlayerAuthProvider;
    };
    //#endregion

    //#region [ constructor ]
    constructor() {
        this.providers = {
            user: new UserAuthProvider(),
            player: new PlayerAuthProvider(),
        };
    }
    //#endregion

    //#region [ IAuthStrategy ]
    async register(client: ISocketClient, data: any): Promise<IAuthInfo<IUser, IToken>> {
        if (!data || !data.provider) { throw new Error('provider required.'); }

        let info: IAuthInfo<IUser, string>;
        switch (data.provider) {
            case 'user': info = await this.providers.user.register(client, data); break;
            case 'player': info = await this.providers.player.register(client, data); break;
            default: throw new Error('Invalid data');
        }
        const authInfo = { user: info.user, token: { provider: data.provider, value: info.token } };
        this._providerByClientId[client.id] = data.provider;
        return authInfo;
    }
    async login(client: ISocketClient, data: any): Promise<IAuthInfo<IUser, IToken>> {
        if (!data || !data.provider) { throw new Error('provider required.'); }

        let info: IAuthInfo<IUser, string>;
        switch (data.provider) {
            case 'user': info = await this.providers.user.login(client, data); break;
            case 'player': info = await this.providers.player.login(client, data); break;
            default: throw new Error('Invalid data');
        }
        const authInfo = { user: info.user, token: { provider: data.provider, value: info.token } };
        this._providerByClientId[client.id] = data.provider;
        return authInfo;
    }
    async logout(client: ISocketClient): Promise<void> {
        const provider = this._providerByClientId[client.id];
        switch (provider) {
            case 'user': await this.providers.user.logout(client); break;
            case 'player': await this.providers.player.logout(client); break;
            default: throw new Error(`No provider found for client id: ${client.id}`);
        }
        delete this._providerByClientId[client.id];
    }
    async authenticate(client: ISocketClient, data: any): Promise<IUser> {
        if (!data || !data.provider) { throw new Error('provider required.'); }

        let user: IUser;
        switch (data.provider) {
            case 'user': user = await this.providers.user.authenticate(client, data.value); break;
            case 'player': user = await this.providers.player.authenticate(client, data.value); break;
            default: throw new Error('Invalid token');
        }
        this._providerByClientId[client.id] = data.provider;
        return user;
    }
    //#endregion
}

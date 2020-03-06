import { IAuthUser } from '@/models';
import { DBProviderBase } from '@/lib/db/providers/DBProviderBase';
import { IDBCreationArgs } from '@/lib/db/IDBCreationArgs';

import { IMainDBProvider, IUserMainDBProvider, IPlayerMainDBProvider } from './main.db.interfaces';
import { UserMainDBProvider } from './model.providers/user.main.db.provider';
import { DBManager } from '../../DBManager';
import { PlayerMainDBProvider } from './model.providers/player.main.db.provider';

export class MainDBProvider extends DBProviderBase<DBManager> implements IMainDBProvider {

    constructor(dbCreationArgs?: IDBCreationArgs) {
        super(dbCreationArgs);

        this.register('users', new UserMainDBProvider());
        this.register('players', new PlayerMainDBProvider());
    }

    //#region [ IMainDBProvider ]
    public get users(): IUserMainDBProvider { return this.get<UserMainDBProvider>('users'); }
    public get players(): IPlayerMainDBProvider { return this.get<PlayerMainDBProvider>('players'); }
    //#endregion

    //#region  [ IAuthRepository ]
    createUser(email: string, encryptedPassword: string): Promise<IAuthUser> {
        return this.users.createUser(email, encryptedPassword);
    }
    getUserByEmail(email: string): Promise<IAuthUser | null> {
        return this.users.getUserByEmail(email);
    }
    //#endregion

}

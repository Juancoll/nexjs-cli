import { User, Player } from '@/models/main';

import { ModelProviderBase } from '@/lib/db';

import { IPlayerMainDBProvider } from '../main.db.interfaces';
import { DBManager } from '../../../DBManager';

export class PlayerMainDBProvider extends ModelProviderBase<DBManager, Player> implements IPlayerMainDBProvider {

    //#region  [ abstract ]
    public collectionName = 'players';
    public toModel(obj: Partial<User>): Player { return new Player(obj); }
    //#endregion

    constructor() {
        super();
    }

}

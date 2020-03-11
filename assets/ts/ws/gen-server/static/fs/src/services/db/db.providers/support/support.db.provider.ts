import { DBProviderBase, IDBCreationArgs } from '@/lib/db';

import { ISupportDBProvider } from './support.db.interfaces';
import { DBManager } from '../../DBManager';

export class SupportDBProvider extends DBProviderBase<DBManager> implements ISupportDBProvider {
    constructor(
        dbCreationArgs: IDBCreationArgs,
    ) {
        super(dbCreationArgs);
    }
}

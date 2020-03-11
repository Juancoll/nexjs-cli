import { DBProviderBase, IDBCreationArgs } from '@/lib/db';

import { IAnalyticsDBProvider } from './analytics.db.interfaces';
import { DBManager } from '../../DBManager';

export class AnalyticsDBProvider extends DBProviderBase<DBManager> implements IAnalyticsDBProvider {
    constructor(
        dbCreationArgs: IDBCreationArgs,
    ) {
        super(dbCreationArgs);
    }
}

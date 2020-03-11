import { DBProviderBase, IDBCreationArgs } from '@/lib/db';

import { IFeedbackDBProvider } from './feedback.db.interfaces';
import { DBManager } from '../../DBManager';

export class FeedbackDBProvider extends DBProviderBase<DBManager> implements IFeedbackDBProvider {
    constructor(
        dbCreationArgs: IDBCreationArgs,
    ) {
        super(dbCreationArgs);
    }
}

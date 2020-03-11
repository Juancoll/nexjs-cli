import { DBManagerBase, DBProviderBase } from '@/lib/db';
import { IAuthRepository } from '@/lib/db/IAuthRepository';

import { MainDBProvider, SupportDBProvider, FeedbackDBProvider, AnalyticsDBProvider } from './db.providers';

export class DBManager extends DBManagerBase {

    //#region [ properties ]
    public get main(): MainDBProvider { return this.get<MainDBProvider>(this.key); }
    public get support(): SupportDBProvider { return this.get<SupportDBProvider>('support'); }
    public get feedback(): FeedbackDBProvider { return this.get<FeedbackDBProvider>('feedback'); }
    public get analytics(): AnalyticsDBProvider { return this.get<AnalyticsDBProvider>('analytics'); }
    //#endregion

    constructor(private key: string, authProvider: IAuthRepository & DBProviderBase<DBManager>) {
        super(key, authProvider);
    }
}

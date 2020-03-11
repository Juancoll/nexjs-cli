import * as Agenda from 'agenda';

import { JobManagerBase } from '@/lib/jobs/JobManagerBase';

import { TestJobsProvider } from './providers/test.job.provider';

export class JobManager extends JobManagerBase {

    //#region [ JobsManagerBase ]
    protected initializeAgenda(agenda: Agenda): void {

        agenda.maxConcurrency(20);      // max number of jobs that can be running at any given moment
        agenda.defaultConcurrency(5);   // default number of a specific job that can be running at any given moment
        agenda.lockLimit(0);            // max number jobs that can be locked at any given moment
        agenda.defaultLockLimit(0);     // default number of a specific job that can be locked at any given moment

        agenda.processEvery('one minute');
    }
    protected registerProviders() {
        this.register('test', new TestJobsProvider());
    }
    //#endregion

    //#region [ public ]
    public get test() { return this.get<TestJobsProvider>('test'); }
    //#endregion
}

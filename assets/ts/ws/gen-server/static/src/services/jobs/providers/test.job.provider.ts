import * as Agenda from 'agenda';

import { JobProviderBase } from '@/lib/jobs/JobProviderBase';
import { JobManager } from '../JobManager';

enum Names {
    'job1' = 'test-job1',
    'job2' = 'test-job2',
}

export class TestJobsProvider extends JobProviderBase<JobManager> {

    //#region  [ JobsProviderBase ]
    public defineJobs(agenda: Agenda) {
        agenda.define(Names.job1, async job => {

            const param = job.attrs.data.param;
            console.log(`[agenda] start - ${Names.job1} ( ${param} )`);

            return new Promise<void>((resolve, reject) => {
                setTimeout(() => {
                    console.log(`[agenda] end - ${Names.job1}`);
                    resolve();
                }, 15000);
            });
        });

        agenda.define(Names.job2, async job => {

            const param = job.attrs.data.param;
            console.log(`[agenda] start - ${Names.job2} ( ${param} )`);

            return new Promise<void>((resolve, reject) => {
                setTimeout(() => {
                    console.log(`[agenda] end - ${Names.job2}`);
                    resolve();
                }, 25000);
            });
        });
    }
    //#endregion

    public async runJob1() {
        await this.manager.agenda.now(Names.job1, { param: 'my param' });
    }
    public async runJob2() {
        await this.manager.agenda.now(Names.job2, { param: 'my new param' });
    }
}

import { Injectable } from '@nestjs/common';
import { jobs } from '@/services/jobs';
import { Rest } from '@/lib/ws';
import { ContractBase } from './base/ContractBase';

@Injectable()
export class JobsContract extends ContractBase {
    //#region [ contractBase ]
    public readonly name = 'jobs';
    //#endregion

    //#region [ constructor ]
    constructor() { super(); }
    //#endregion

    //#region [ events ]
    //#endregion

    //#region  [ methods ]
    @Rest()
    async runJob(): Promise<void> {
        this.logger.log('run job');
        jobs.test.runJob1();
        jobs.test.runJob2();
    }

    @Rest()
    async start(): Promise<void> {
        this.logger.log('start');
        jobs.start();
    }

    @Rest()
    async stop(): Promise<void> {
        this.logger.log('stop');
        jobs.stop();
    }
    //#endregion
}

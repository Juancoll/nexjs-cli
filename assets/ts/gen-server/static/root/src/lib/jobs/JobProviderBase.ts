import * as Agenda from 'agenda';
import { JobManagerBase } from './JobManagerBase';

export abstract class JobProviderBase<TManager extends JobManagerBase> {

    //#region  [ properties ]
    public manager: TManager;
    //#endregion

    //#region  [ abstract ]
    protected abstract defineJobs(agenda: Agenda): void;
    //#endregion

    //#region  [ public ]
    public initialize() {
        if (!this.manager) {
            throw new Error('jobs provider required to be registered in Job Manager');
        }
        this.defineJobs(this.manager.agenda);
    }
    //#endregion
}

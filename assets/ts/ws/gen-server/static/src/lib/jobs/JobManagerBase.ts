// doc: https://github.com/agenda/agenda

import { SignalDispatcher, SimpleEventDispatcher, EventDispatcher } from 'strongly-typed-events';
import * as Agenda from 'agenda';
import { Db } from 'mongodb';
import { Logger } from '@nestjs/common';

import { JobProviderBase } from './JobProviderBase';

export abstract class JobManagerBase {

    //#region [ abstract ]
    protected abstract initializeAgenda(agenda: Agenda): void;
    protected abstract registerProviders(): void;
    //#endregion

    //#region  [ fields ]
    private _agenda: Agenda;
    private _providers: { [key: string]: JobProviderBase<any> } = {};
    //#endregion

    //#region [ properties ]
    public get agenda(): Agenda {
        return this._agenda;
    }
    public readonly logger: Logger;
    public debug = true;
    //#endregion

    //#region [ events ]
    public onReady = new SignalDispatcher();
    public onError = new SimpleEventDispatcher<Error>();
    public onJobStart = new SimpleEventDispatcher<Agenda.Job>();
    public onJobComplete = new SimpleEventDispatcher<Agenda.Job>();
    public onJobSuccess = new SimpleEventDispatcher<Agenda.Job>();
    public onJobFail = new EventDispatcher<Agenda.Job, any>();
    //#endregion

    //#region [ constructor ]
    constructor() {
        this.logger = new Logger(this.constructor.name);
    }
    //#endregion

    //#region [ public ]
    public initializeFromConnectionString(connectionString: string, collectionName: string) {
        this._agenda = new Agenda({
            db: {
                address: connectionString,
                collection: collectionName,
                options: {
                    // useNewUrlParser: true,
                    // useUnifiedTopology: true,
                },
            },
        });
        this.initialize();
    }
    public initializeFromInstance(mongoInstance: Db, collectionName: string) {
        this._agenda = new Agenda({ mongo: mongoInstance, db: { collection: collectionName } });

        this.initialize();
    }
    public async start(): Promise<void> {
        if (!this.agenda) {
            throw new Error('Initialize first');
        }
        await this.agenda.start();
    }
    public stop(): Promise<void> {
        if (!this.agenda) {
            throw new Error('Initialize first');
        }
        return this.agenda.stop();
    }
    //#endregion

    //#region [ protected ]
    protected register(name: string, provider: JobProviderBase<any>) {

        provider.manager = this;
        provider.initialize();
        this._providers[name] = provider;
    }
    protected get<T extends JobProviderBase<any>>(name: string): T {
        if (!this._providers[name]) {
            throw new Error(`Job provider '${name}' not found.`);
        }
        return this._providers[name] as T;
    }
    protected log(msg: string, obj?: any) {
        if (this.debug) {
            this.logger.log(msg);
            if (obj) {
                console.log(obj);
            }
        }
    }
    protected error(msg: string, obj?: any) {
        if (this.debug) {
            this.logger.error(msg);
            if (obj) {
                console.log(obj);
            }
        }
    }
    protected execute(debugMessage: string, func: () => void) {
        if (this.debug) {
            this.logger.log(debugMessage);
        }
        try {
            func();
        } catch (err) {
            if (this.debug) {
                this.error('error object', err);
            }
            this.onError.dispatch(err);
        }
    }
    //#endregion

    //#region [ private ]
    private initialize() {
        // register events
        this.agenda.on('ready', () => this.execute('onReady', () => this.onReady.dispatch()));
        this.agenda.on('error', (err: Error) => this.execute('onError', () => this.onError.dispatch(err)));

        this.agenda.on('start', (job: Agenda.Job) => this.execute(`onJobStart '${job.attrs.name}'`, () => this.onJobStart.dispatch(job)));
        this.agenda.on('complete', (job: Agenda.Job) => this.execute(`onJobComplete '${job.attrs.name}'`, () => this.onJobComplete.dispatch(job)));
        this.agenda.on('success', (job: Agenda.Job) => this.execute(`onJobSuccess '${job.attrs.name}'`, () => this.onJobSuccess.dispatch(job)));
        this.agenda.on('fail', (err: Error, job: Agenda.Job) => this.execute(
            `onJobFail '${job.attrs.name}'`,
            () => this.onJobFail.dispatch(job, err),
        ));

        this.initializeAgenda(this.agenda);
        this.registerProviders();
    }
    //#endregion
}

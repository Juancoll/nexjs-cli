import { MongoClient } from 'mongodb';

import { IDBCreationArgs } from '../IDBCreationArgs';
import { MongoDBConnection } from '../MongoDBConnection';
import { DBManagerBase } from '../DBManagerBase';
import { IDBProvider } from './IDBProvider';
import { SimpleEventDispatcher, SignalDispatcher } from 'strongly-typed-events';
import { ModelProviderBase } from './ModelProviderBase';

export abstract class DBProviderBase<TManager extends DBManagerBase> implements IDBProvider {

    public static RECONNECTION_INTERVAL = 5000;

    //#region  [ fields ]
    private _providers: { [key: string]: ModelProviderBase<TManager, any> } = {};
    private _conn: MongoDBConnection;
    private _manager: TManager;
    private _connectedHosts: string[] = [];
    private _firstConnection = true;
    //#endregion

    //#region  [ properties ]
    public readonly _type: string;
    public get conn() { return this._conn; }
    public set conn(conn: MongoDBConnection) {
        this._conn = conn;
        for (const name in this._providers) {
            if (name) {
                this._providers[name].conn = conn;
            }
        }
    }
    public get manager(): TManager { return this._manager; }
    public set manager(manager: TManager) {
        this._manager = manager;
        for (const name in this._providers) {
            if (name) {
                this._providers[name].manager = manager;
            }
        }
    }
    //#endregion

    //#region  [ events ]
    onError = new SimpleEventDispatcher<any>();
    onConnected = new SignalDispatcher();
    onReconnected = new SignalDispatcher();
    onReconnecting = new SignalDispatcher();
    onDisconnected = new SignalDispatcher();
    onHostsChange = new SimpleEventDispatcher<string[]>();
    //#endregion

    constructor(
        protected readonly dbCreationArgs: IDBCreationArgs,
    ) {
        this._type = this.constructor.name;
    }

    //#region  [ public ]
    public async connect(): Promise<void> {
        try {

            const mongo = new MongoClient(
                this.dbCreationArgs.connectionString,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true,
                },
            );
            // see: http://mongodb.github.io/node-mongodb-native/3.4/reference/unified-topology/
            // see: http://mongodb.github.io/node-mongodb-native/3.4/reference/management/sdam-monitoring/
            mongo.on('serverDescriptionChanged', (event) => {
                this.updateHosts(event.newDescription.hosts);
            });

            await mongo.connect();
            const db = mongo.db(this.dbCreationArgs.dbName);
            this.conn = new MongoDBConnection(mongo, db);
            this.onConnected.dispatch();

        } catch (err) {
            this.onError.dispatch(err);
            this.startReconnectionTimeout();
        }
    }
    removeCollection(name: string): Promise<boolean> {
        return this.conn.db.dropCollection(name);
    }
    public get<T extends ModelProviderBase<TManager, any>>(key: string): T {
        if (!this._providers[key]) {
            throw new Error(`model provider ${key} not found`);
        }
        return this._providers[key] as T;
    }
    //#endregion

    //#region  [ protected ]
    public register(key: string, provider: ModelProviderBase<TManager, any>): void {
        this._providers[key] = provider;
        provider.conn = this.conn;
        provider.manager = this.manager;
    }
    //#endregion

    //#region  [ private ]
    private startReconnectionTimeout() {
        setTimeout(async () => {
            this.onReconnecting.dispatch();
            await this.connect();
        }, DBProviderBase.RECONNECTION_INTERVAL);
    }
    private updateHosts(hosts: string[]) {
        if (hosts.length != this._connectedHosts.length) {
            if (hosts.length == 0) {
                this.onDisconnected.dispatch();
            } else if (this._connectedHosts.length == 0) {
                if (this._firstConnection) {
                    this._firstConnection = false;
                } else {
                    this.onReconnected.dispatch();
                }
            } else {
                this.onHostsChange.dispatch(hosts);
            }
        } else {
            const a = hosts.sort();
            const b = this._connectedHosts.sort();
            let areEquals = true;
            for (let i = 0; i < hosts.length; ++i) {
                if (a[i] != b[i]) {
                    areEquals = false;
                    break;
                }
            }
            if (!areEquals) {
                this.onHostsChange.dispatch(hosts);
            }
        }

        this._connectedHosts = hosts;
    }
    //#endregion
}

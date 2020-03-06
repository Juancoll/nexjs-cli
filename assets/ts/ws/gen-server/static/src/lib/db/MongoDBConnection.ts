import { MongoClient, Db } from 'mongodb';

export class MongoDBConnection {

    private _connection: MongoClient;
    private _db: Db;

    public get connection() {
        return this._connection;
    }
    public get db() {
        return this._db;
    }

    constructor(conn: MongoClient, db: Db) {
        this._connection = conn;
        this._db = db;
    }
}

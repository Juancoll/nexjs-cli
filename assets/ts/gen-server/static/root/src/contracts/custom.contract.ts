import { Injectable } from '@nestjs/common';

import { db } from '@/services/db';
import { User } from '@/models/main';
import { Rest } from '@nexjs/wsserver';
import { ContractBase } from './base/ContractBase';

@Injectable()
export class DBContract extends ContractBase {
    //#region [ IContractBase ]
    public readonly name = 'custom';
    //#endregion

    //#region [ constructor ]
    constructor() { super(); }
    //#endregion

    //#region [ events ]
    //#endregion

    //#region  [ methods ]
    @Rest()
    check(): Promise<void> {
        this.logger.log('check()');
        throw new Error('Method not implemented.');
    }
    @Rest()
    removeCollection(dbName: string, collectionName: string): Promise<boolean> {
        this.logger.log(`removeCollection( ${name} )`);
        return (db as any)[dbName].removeCollection(collectionName);
    }

    @Rest()
    createManyUsers(count: number, createAdmin: boolean): Promise<User[]> {
        this.logger.log(`createManyUsers( ${count}, ${createAdmin} )`);
        return db.main.users.createMany(count, createAdmin);
    }
    //#endregion
}

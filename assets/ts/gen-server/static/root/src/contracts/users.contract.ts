import { Injectable } from '@nestjs/common';

import { User } from '@/models/main';
import { db } from '@/services/db';
import { ContractBase } from './base/ContractBase';
import { Rest } from '@nexjs/wsserver';

@Injectable()
export class UsersContract extends ContractBase {
    //#region [ IContractBase ]
    public readonly name = 'users';
    //#endregion

    //#region [ constructor ]
    constructor() { super(); }
    //#endregion

    //#region [ events ]
    //#endregion

    //#region  [ methods ]
    @Rest()
    list(): Promise<User[]> {
        return db.main.users.list();
    }

    @Rest()
    findById(id: string): Promise<User> {
        return db.main.users.findById(id);
    }

    @Rest()
    findOne(query: Partial<User>): Promise<User> {
        return db.main.users.findOne(query);
    }

    @Rest()
    findMany(query: Partial<User>): Promise<User[]> {
        return db.main.users.findMany(query);
    }

    @Rest()
    updateQuery(filter: Partial<User>, query: Partial<User>): Promise<number> {
        return db.main.users.updateQuery(filter, query);
    }

    @Rest()
    updateModel(model: User): Promise<User> {
        return db.main.users.updateModel(model);
    }
    //#endregion
}

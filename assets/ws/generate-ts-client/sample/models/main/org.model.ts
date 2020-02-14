import { Model } from '../base/base.model';
import { IModelRef } from '../interfaces/IModelRef';

export interface Permissions {
    all: string;
    players: Array<IModelRef<string>>;
}

export class Org extends Model {
    name: string;
    owner: IModelRef<void>;
    users: IModelRef<Permissions>;
    players: IModelRef<void>;

    constructor(init?: Partial<Org>) { super(init); }
}

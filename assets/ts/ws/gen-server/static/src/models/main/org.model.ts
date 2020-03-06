import { Model } from '../base/base.model';
import { ModelRef, DataModelRef } from '../base/ref.model';

export interface Permissions {
    all: string;
    players: Array<DataModelRef<string>>;
}

export class Org extends Model {
    name: string;
    owner: ModelRef;
    users: DataModelRef<Permissions>;
    players: ModelRef;

    constructor(init?: Partial<Org>) { super(init); }
}

import { DataModelRef } from './DataModelRef';

export class Permissions {
    public all: string;
    public players: Array<DataModelRef<string>>;

    constructor(init?: Partial<Permissions>) {  Object.assign(this, init); }
}

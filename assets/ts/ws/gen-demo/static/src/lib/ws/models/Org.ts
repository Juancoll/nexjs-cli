import { Model } from './Model';
import { ModelComponent } from './ModelComponent';
import { ModelRef } from './ModelRef';
import { DataModelRef } from './DataModelRef';
import { Permissions } from './Permissions';

export class Org extends Model {
    public name: string;
    public owner: ModelRef;
    public users: DataModelRef<Permissions>;
    public players: ModelRef;

    constructor(init?: Partial<Org>) { super();  Object.assign(this, init); }
}

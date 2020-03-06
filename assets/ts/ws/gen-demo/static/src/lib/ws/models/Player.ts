import { Model } from './Model';
import { ModelComponent } from './ModelComponent';
import { ModelRef } from './ModelRef';

export class Player extends Model {
    public serial: string;
    public owner: ModelRef;

    constructor(init?: Partial<Player>) { super();  Object.assign(this, init); }
}

import { Model } from '../base/base.model';
import { ModelRef } from '../base/ref.model';

export class Player extends Model {
    name: string;
    label: string;
    serial: string;
    owner: ModelRef;

    constructor(init?: Partial<Player>) { super(init); }
}

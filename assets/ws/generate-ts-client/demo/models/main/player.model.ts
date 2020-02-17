import { Model } from '../base/base.model';
import { IModelRef } from '../interfaces/IModelRef';

export class Player extends Model {
    serial: string;
    owner: IModelRef<void>;

    constructor(init?: Partial<Player>) { super(init); }
}

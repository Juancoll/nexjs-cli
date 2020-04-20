import { Model } from '../base/base.model';
import { IncludeModel, IncludeMethod } from '@nexjs/wsserver';

@IncludeModel
export class CustomModel extends Model {
    name: string;
    aaa: string;

    constructor(init?: Partial<CustomModel>) { super(init); }

    @IncludeMethod()
    functionA<T>(a: T) {
        return true;
    }

    @IncludeMethod()
    functionB<T>(): T {
        return undefined;
    }
}

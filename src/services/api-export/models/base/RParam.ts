import { RType } from './RType';
import { RDecorator } from './RDecorator';

export class RParam {
    name: string;
    type: RType;
    decorators: RDecorator[];

    constructor(init?: Partial<RParam>) { Object.assign(this, init); }
}
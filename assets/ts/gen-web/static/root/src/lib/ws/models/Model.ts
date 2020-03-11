import { ModelComponent } from './ModelComponent';

export class Model {
    public components: ModelComponent[];
    public _type: string;
    public _id: any;
    public enabled: boolean;
    public createdAt: number;
    public updatedAt: number;

    constructor(init?: Partial<Model>) {  Object.assign(this, init); }
}

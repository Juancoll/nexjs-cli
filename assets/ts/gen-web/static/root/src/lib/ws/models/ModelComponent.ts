
export class ModelComponent {
    public _type: string;
    public data: any;

    constructor(init?: Partial<ModelComponent>) {  Object.assign(this, init); }
}

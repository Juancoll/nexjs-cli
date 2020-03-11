
export class ModelRef {
    public info: string;
    public modelId: any;

    constructor(init?: Partial<ModelRef>) {  Object.assign(this, init); }
}


export class DataModelRef<TData> {
    public modelId: any;
    public info: string;
    public data: TData;

    constructor(init?: Partial<DataModelRef<TData>>) {  Object.assign(this, init); }
}

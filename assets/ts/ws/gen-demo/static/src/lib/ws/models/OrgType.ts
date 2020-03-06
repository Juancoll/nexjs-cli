
export class OrgType {
    public a: string;
    public b: boolean;

    constructor(init?: Partial<OrgType>) {  Object.assign(this, init); }
}

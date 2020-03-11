
export class MyDTO {
    public a: string;
    public b: boolean;

    constructor(init?: Partial<MyDTO>) {  Object.assign(this, init); }
}

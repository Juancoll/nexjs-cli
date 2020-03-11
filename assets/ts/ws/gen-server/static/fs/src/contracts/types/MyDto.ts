export class MyDTO {
    a: string;
    b: boolean;

    constructor(init?: Partial<MyDTO>) { Object.assign(this, init); }
}

export class RDecorator<TOptions = any> {
    name: string;
    options?: TOptions;

    constructor(init?: Partial<RDecorator>) { Object.assign(this, init); }
}
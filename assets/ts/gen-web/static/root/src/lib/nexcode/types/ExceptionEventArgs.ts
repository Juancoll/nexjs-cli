export class ExceptionEventArgs {
    private _message: string;
    public get message(): string {
        return this._message;
    }
    constructor(msg: string) {
        this._message = msg;
    }
}

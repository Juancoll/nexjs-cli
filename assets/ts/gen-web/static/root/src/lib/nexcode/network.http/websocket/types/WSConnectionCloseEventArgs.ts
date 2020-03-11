export class WSConnectionCloseEventArgs {
    public code: number;
    public reason: string;
    public wasClean: boolean;

    constructor(code: number, reason: string, wasClean: boolean) {
        this.code = code;
        this.reason = reason;
        this.wasClean = wasClean;
    }
}

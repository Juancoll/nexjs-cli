export abstract class WSBase {
    public debug = false;

    constructor(
        private readonly logId: string,
    ) { }

    protected wait(millis: number = 1000): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => { resolve(); }, millis);
        });
    }

    //#region [ log ]
    protected log(msg: string, data?: any) {
        if (this.debug) {
            if (data) {
                console.log(`[${this.logId}] ${msg}`, data);
            } else {
                console.log(`[${this.logId}] ${msg}`);
            }
        }
    }
    protected error(msg: string, data?: any) {
        if (this.debug) {
            if (data) {
                console.error(`[${this.logId}] ${msg}`, data);
            } else {
                console.error(`[${this.logId}] ${msg}`);
            }
        }
    }
    protected warn(msg: string, data?: any) {
        if (this.debug) {
            if (data) {
                console.warn(`[${this.logId}] ${msg}`, data);
            } else {
                console.warn(`[${this.logId}] ${msg}`);
            }
        }
    }
    //#endregion
}

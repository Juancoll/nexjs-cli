export class Delay {

    private _func: (arg: any) => void;
    private _handle: any;
    private _isRunning: boolean = false;

    public get isRunning() {
        return this._isRunning;
    }

    constructor(func: (arg: any) => void) {
        this._func = func;
    }

    public start(delayTime: number, arg?: any) {
        this._handle = setTimeout(() => {
            this._func(arg);
            this._isRunning = false;
            this._handle = null;
        }, delayTime);
        this._isRunning = true;
        return this;
    }
    public stop() {
        if (this._handle != null) {
            clearTimeout(this._handle);
            this._handle = null;
        }
        this._isRunning = false;
        return this;
    }
}

// tslint:disable-next-line: max-classes-per-file
export class DelayAsync {
    start(millis: number = 1000): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            setTimeout(() => { resolve(); }, millis);
        });
    }
}

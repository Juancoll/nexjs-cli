export class EventArgs<T> {
    private _value: T;
    public get value(): T {
        return this._value;
    }
    constructor(value: T) {
        this._value = value;
    }
}

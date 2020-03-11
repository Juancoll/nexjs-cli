export class LocalStorageRepository {
    private readonly _key: string;
    private readonly _encrypt: boolean = true;

    constructor(key: string, encrypt: boolean) {
        this._key = key;
        this._encrypt = encrypt;
    }

    save(data: any) {
        const str = this._encrypt
            ? btoa(JSON.stringify(data))
            : JSON.stringify(data);

        localStorage.setItem(this._key, str);
    }
    open(): any {
        const item = localStorage.getItem(this._key);
        return !item
            ? undefined
            : this._encrypt
                ? JSON.parse(atob(item))
                : JSON.parse(item);
    }
    clear(): any {
        const item = localStorage.removeItem(this._key);
    }
}

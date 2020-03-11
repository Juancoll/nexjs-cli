export class Version {
    private _major: number;
    private _minor: number;
    private _patch: number;

    public get major() {
        return this._major;
    }
    public get minor() {
        return this._minor;
    }
    public get patch() {
        return this._patch;
    }

    constructor(stringOrNumber: string | number, minor?: number, path?: number) {
        if (typeof stringOrNumber == 'string') {
            const split = stringOrNumber.split('.');
            if (split.length != 3) {
                throw new Error('format error. must be \'[major].[minor].[patch]');
            }
            try {
                this._major = parseInt(split[0]);
                this._minor = parseInt(split[1]);
                this._patch = parseInt(split[2]);
                if (Number.isNaN(this._major) ||
                    Number.isNaN(this._minor) ||
                    Number.isNaN(this._patch)) {
                    throw new Error('format error. must be \'[major].[minor].[patch]');
                }
            } catch (err) {
                throw new Error('format error. must be \'[major].[minor].[patch]');
            }
        } else if (typeof stringOrNumber == 'number') {
            if (!minor || !path) {
                throw new Error('minor and path values are required');
            }

            this._major = stringOrNumber;
            this._minor = minor;
            this._patch = path;
            if (!Number.isInteger(this._major) ||
                !Number.isInteger(this._minor) ||
                !Number.isInteger(this._patch)) {
                throw new Error('format error. must be \'[major].[minor].[patch]');
            }
        } else {
            throw new Error('format error. must be \'[major].[minor].[patch]');
        }
    }
    compare(version: Version) {
        if (this._major > version._major) { return 1; } else if (this._major < version._major) { return -1; } else {
            if (this._minor > version._minor) { return 1; } else if (this._minor < version._minor) { return -1; } else {
                if (this._patch > version._patch) { return 1; } else if (this._patch < version._patch) { return -1; } else { return 0; }
            }
        }
    }
    increment(major: number, minor: number, patch: number) {
        this._major += major;
        this._minor += minor;
        this._patch += patch;
    }
    toString() {
        return `${this._major}.${this._minor}.${this._patch}`;
    }
}

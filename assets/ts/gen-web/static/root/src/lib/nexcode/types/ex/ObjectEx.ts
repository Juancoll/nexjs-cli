export class ObjectEx {
    public static get(obj: object, path: string, create: boolean = false): any {
        const keys = path.split('.').filter(x => x != '');
        let ref: any = obj;
        // tslint:disable-next-line: prefer-for-of
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (typeof ref[key] == 'undefined') {
                if (create) {
                    ref[key] = {};
                } else {
                    throw new Error(`property ${key} in path ${path} not found.`);
                }
            }
            ref = ref[key];
        }
        return ref;
    }
    public static set(obj: object, path: string, value: any, create: boolean = true) {
        const keys = path.split('.').filter(x => x != '');
        let ref: any = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (typeof ref[key] === 'undefined') {
                if (create) {
                    ref[key] = {};
                } else {
                    throw new Error(`property ${key} in path ${path} not found.`);
                }
            }
            ref = ref[key];
        }
        const lastIdx = keys.length - 1;
        ref[keys[lastIdx]] = value;
    }
    public static update(obj: object, path: string, value: any, create: boolean = true) {
        const keys = path.split('.').filter(x => x != '');
        const ref: any = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (typeof ref[key] === 'undefined') {
                if (create) {
                    ref[key] = {};
                } else {
                    throw new Error(`property ${key} in path ${path} not found.`);
                }
            }
        }
        const lastIdx = keys.length - 1;
        const currentValue = ref[keys[lastIdx]];
        const newValue = Object.assign({}, currentValue, value);
        ref[keys[lastIdx]] = newValue;
    }
}

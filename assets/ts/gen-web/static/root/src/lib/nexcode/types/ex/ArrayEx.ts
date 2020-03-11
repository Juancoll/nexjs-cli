export class ArrayEx {
    public static contains(array: any[], value: any) {
        let i = array.length;
        while (i--) {
            if (array[i] === value) {
                return true;
            }
        }
        return false;
    }
    public static exists<T>(array: T[], func: (x: T) => boolean): boolean {
        let i = array.length;
        while (i--) {
            const res = func(array[i]);
            if (res) {
                return true;
            }
        }
        return false;
    }
    public static assign<T>(array: T[]): T[] {
        const copy = new Array<T>();
        array.forEach(x => {
            copy.push(Object.assign({}, x));
        });
        return copy;
    }
    public static containsDuplicateValues(array: string[]): boolean {
        const obj: any = {};
        let i = array.length;
        while (i--) {
            const value = array[i];
            if (typeof obj[value] !== 'undefined') {
                return true;
            }
            obj[value] = value;
        }
        return false;
    }

    public static clear<T>(array: T[]) {
        while (array.length > 0) {
            array.pop();
        }
    }
}

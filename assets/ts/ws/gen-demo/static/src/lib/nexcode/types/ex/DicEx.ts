import { IDic } from '../IDic';

export class DicEx {
    public static containsKey<T>(obj: IDic<T>, key: string): boolean {
        return (obj as object).hasOwnProperty(key);
    }
    public static remove<T>(obj: IDic<T>, key: string): boolean {
        return delete obj[key];
    }
    public static getValues<T>(obj: IDic<T>): T[] {
        return Object.keys(obj).map(k => obj[k]);
    }

    public static get<T>(obj: IDic<T>, key: string): T {
        return obj[key];
    }
    public static set<T>(obj: IDic<T>, key: string, value: T): void {
        obj[key] = value;
    }
    public static clear<T>(obj: IDic<T>): void {
        Object.keys(obj).forEach(key => { delete obj[key]; });
    }
    public static keys<T>(obj: IDic<T>): string[] {
        return Object.keys(obj);
    }
    public static values<T>(obj: IDic<T>): T[] | undefined {
        if (obj) {
            return Object.keys(obj).map(k => obj[k]);
        }
    }
}

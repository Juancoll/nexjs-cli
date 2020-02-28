export interface IDicBase {
    [key: string]: any;
}

export interface IDic<T> extends IDicBase {
    [key: string]: T;
}

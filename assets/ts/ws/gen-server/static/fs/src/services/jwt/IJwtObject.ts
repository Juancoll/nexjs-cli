export interface IJwtObject<T> {
    header: {
        alg: string;
        typ: string;
    };
    payload: T & { iat: number, exp: number };
    signature: string;
}

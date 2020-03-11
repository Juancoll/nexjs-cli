import * as JWT from 'jsonwebtoken';
import { IJwtObject } from './IJwtObject';

export class Jwt {
    constructor(
        private options: { secret: string, signOptions: JWT.SignOptions }
    ) { }

    public sign(value: any) {
        return JWT.sign(value, this.options.secret, this.options.signOptions);
    }
    public verify<T>(token: string): T {
        const result = JWT.verify(token, this.options.secret) as any;
        delete result.iat;
        delete result.exp;
        return result;
    }
    public decode<T>(token: string): IJwtObject<T> {
        return JWT.decode(token, { complete: true }) as IJwtObject<T>;
    }
}
import { env } from '../env';
import { Jwt } from './Jwt';

export const jwt = new Jwt({
    secret: env.vars.crypt.jwt_secret,
    signOptions: { expiresIn: env.vars.crypt.jwt_expiresIn },
});

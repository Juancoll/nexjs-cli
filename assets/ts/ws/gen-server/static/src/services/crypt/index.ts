import { Crypt } from './Crypt';

export const crypt = new Crypt(parseInt(process.env.BCRYPT_SALT_ROUNDS, 10));

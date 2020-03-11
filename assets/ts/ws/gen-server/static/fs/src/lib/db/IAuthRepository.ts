import { IAuthUser } from '@/models/interfaces/IAuthUser';

export interface IAuthRepository {
    createUser(email: string, encryptedPassword: string): Promise<IAuthUser>;
    getUserByEmail(email: string): Promise<IAuthUser | null>;
}

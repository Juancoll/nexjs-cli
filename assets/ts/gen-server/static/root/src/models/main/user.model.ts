import { IAuthUser } from '../interfaces/IAuthUser';
import { Model } from '../base/base.model';

export class User extends Model implements IAuthUser {
    email: string;
    password?: string;
    roles: string[];
    name?: string;
    surname?: string;

    constructor(init?: Partial<User>) { super(init); }
}

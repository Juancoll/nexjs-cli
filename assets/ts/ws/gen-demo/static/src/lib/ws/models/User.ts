import { Model } from './Model';
import { ModelComponent } from './ModelComponent';

export class User extends Model {
    public email: string;
    public password: string;
    public roles: string[];
    public name: string;
    public surname: string;

    constructor(init?: Partial<User>) { super();  Object.assign(this, init); }
}

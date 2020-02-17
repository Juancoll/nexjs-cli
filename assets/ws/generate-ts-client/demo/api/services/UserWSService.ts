import { WSServiceBase } from '../../lib';
import { User } from '../../models/main/user.model';

export class UserWSService extends WSServiceBase {
    public readonly name = 'user';

    //#region [ hub ]
    public onUserUpdate = this.newEvent<string, User>('onUserUpdate');
    //#endregion

    //#region [ rest ]
    public funcA() { return this.request<string>('funcA', null, null); }
    public funcB(name: string, surname: string, email: string) { return this.request<string>('funcB', { name, surname, email }, null); }
    public changeUser(name: string, surname: string) { return this.request<User>('changeUser', { name, surname }, null); }
    //#endregion
}

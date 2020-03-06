import { WSServiceBase } from '../../lib';
import { HubNotification } from '../../lib/clients/hub/notifications/HubNotification';
import { HubNotificationCredentials } from '../../lib/clients/hub/notifications/HubNotificationCredentials';
import { HubNotificationCredentialsData } from '../../lib/clients/hub/notifications/HubNotificationCredentialsData';
import { HubNotificationData } from '../../lib/clients/hub/notifications/HubNotificationData';
import { MyDTO } from '../../models/MyDTO';
import { User } from '../../models/User';
import { Model } from '../../models/Model';
import { ModelComponent } from '../../models/ModelComponent';
import { Player } from '../../models/Player';
import { ModelRef } from '../../models/ModelRef';
import { Org } from '../../models/Org';
import { DataModelRef } from '../../models/DataModelRef';
import { Permissions } from '../../models/Permissions';

export class DemoWSService extends WSServiceBase {
    //#region [ implement WSServiceBase ]
    public readonly name = 'demo';
    //#endregion

    //#region [ hub ]

    // isAuth: false
    public readonly onUpdate = new HubNotification(this._hub, this.name, 'onUpdate');

    // isAuth: true
    public readonly onUpdateCredentials = new HubNotificationCredentials<MyDTO>(this._hub, this.name, 'onUpdateCredentials');

    // isAuth: true
    public readonly onUpdateCredentialsData = new HubNotificationCredentialsData<MyDTO[], MyDTO>(this._hub, this.name, 'onUpdateCredentialsData');

    // isAuth: true
    public readonly onUpdateData = new HubNotificationData<User>(this._hub, this.name, 'onUpdateData');
    //#endregion

    //#region [ rest ]

     // isAuth: false
    public emitEvents(): Promise<MyDTO> {
        return this.request<MyDTO>( 'emitEvents', null, null );
    }

     // isAuth: true
    public funcA(name: string, surname: string, age: number): Promise<number> {
        return this.request<number>( 'funcA', { name, surname, age }, null );
    }

     // isAuth: true
    public funcB(data: MyDTO, credentials: string): Promise<string> {
        return this.request<string>( 'funcB', data, credentials );
    }

     // isAuth: true
    public funcC(credentials: number): Promise<number> {
        return this.request<number>( 'funcC', null, credentials );
    }

     // isAuth: false
    public funcD(data: string): Promise<void> {
        return this.request<void>( 'funcD', data, null );
    }

     // isAuth: false
    public funcE(data: string): Promise<void> {
        return this.request<void>( 'funcE', data, null );
    }

     // isAuth: true
    public changeUser(name: string, surname: string, player: Player, org: Org): Promise<User> {
        return this.request<User>( 'changeUser', { name, surname, player, org }, null );
    }
    //#endregion
}

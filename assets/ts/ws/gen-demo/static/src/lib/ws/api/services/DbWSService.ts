import { WSServiceBase } from '../../lib';
import { HubNotification } from '../../lib/clients/hub/notifications/HubNotification';
import { HubNotificationCredentials } from '../../lib/clients/hub/notifications/HubNotificationCredentials';
import { HubNotificationCredentialsData } from '../../lib/clients/hub/notifications/HubNotificationCredentialsData';
import { HubNotificationData } from '../../lib/clients/hub/notifications/HubNotificationData';
import { User } from '../../models/User';
import { Model } from '../../models/Model';
import { ModelComponent } from '../../models/ModelComponent';

export class DbWSService extends WSServiceBase {
    //#region [ implement WSServiceBase ]
    public readonly name = 'db';
    //#endregion

    //#region [ hub ]
    //#endregion

    //#region [ rest ]

     // isAuth: false
    public check(): Promise<void> {
        return this.request<void>( 'check', null, null );
    }

     // isAuth: false
    public removeCollection(): Promise<boolean> {
        return this.request<boolean>( 'removeCollection', null, null );
    }

     // isAuth: false
    public createManyUsers(): Promise<User[]> {
        return this.request<User[]>( 'createManyUsers', null, null );
    }
    //#endregion
}

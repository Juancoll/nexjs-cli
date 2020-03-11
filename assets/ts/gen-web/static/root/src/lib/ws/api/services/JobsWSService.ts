import { WSServiceBase } from '../../lib';
import { HubNotification } from '../../lib/clients/hub/notifications/HubNotification';
import { HubNotificationCredentials } from '../../lib/clients/hub/notifications/HubNotificationCredentials';
import { HubNotificationCredentialsData } from '../../lib/clients/hub/notifications/HubNotificationCredentialsData';
import { HubNotificationData } from '../../lib/clients/hub/notifications/HubNotificationData';

export class JobsWSService extends WSServiceBase {
    //#region [ implement WSServiceBase ]
    public readonly name = 'jobs';
    //#endregion

    //#region [ hub ]
    //#endregion

    //#region [ rest ]

     // isAuth: false
    public runJob(): Promise<void> {
        return this.request<void>( 'runJob', null, null );
    }

     // isAuth: false
    public start(): Promise<void> {
        return this.request<void>( 'start', null, null );
    }

     // isAuth: false
    public stop(): Promise<void> {
        return this.request<void>( 'stop', null, null );
    }
    //#endregion
}

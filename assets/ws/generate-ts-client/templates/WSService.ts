import { WSServiceBase } from '../../lib';
import { HubNotification } from '../../lib/hub/notifications/HubNotification';
import { HubNotificationCredentials } from '../../lib/hub/notifications/HubNotificationCredentials';
import { HubNotificationCredentialsData } from '../../lib/hub/notifications/HubNotificationCredentialsData';
import { HubNotificationData } from '../../lib/hub/notifications/HubNotificationData';

{{#imports}}
import { {{&type}} } from '{{&path}}';
{{/imports}}

export class {{serviceUpperName}}WSService extends WSServiceBase {
    //#region [ implement WSServiceBase ]
    public readonly name = '{{serviceName}}';
    //#endregion

    //#region [ hub ]
    {{#hubEvents}}

    // isAuth: {{isAuth}}
    public readonly {{name}} = new {{notification}}{{&arguments}}(this._hub, this.name,'{{name}}');
    {{/hubEvents}}
    //#endregion

    //#region [ rest ]
    {{#restMethods}}

     // isAuth: {{isAuth}}
    public {{name}}({{&methodParams}}): Promise{{&returnType}} { return this.request{{&returnType}}( '{{name}}', {{&requestParams}} ); }
    {{/restMethods}}
    //#endregion
}

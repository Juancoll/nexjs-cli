import { WSServiceBase, HubNotification, HubNotificationCredentials, HubNotificationCredentialsData, HubNotificationData } from '@nexjs/wsclient';

{{#imports}}
import { {{&type}} } from '../../models/{{&path}}';
{{/imports}}

export class {{serviceUpperName}}WSService extends WSServiceBase {
    //#region [ implement WSServiceBase ]
    public readonly name = '{{serviceName}}';
    //#endregion

    //#region [ hub ]
    {{#hubEvents}}

    // isAuth: {{isAuth}}
    public readonly {{name}} = new {{notification}}{{&arguments}}(this._hub, this.name, '{{name}}');
    {{/hubEvents}}
    //#endregion

    //#region [ rest ]
    {{#restMethods}}

     // isAuth: {{isAuth}}
    public {{name}}({{&methodParams}}): Promise{{&returnType}} {
        return this.request{{&returnType}}( '{{name}}', {{&requestParams}});
    }
    {{/restMethods}}
    //#endregion
}

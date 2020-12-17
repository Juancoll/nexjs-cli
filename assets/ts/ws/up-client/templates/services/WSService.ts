import { lib } from '../..'

{{#imports}}
import { {{&type}} } from '../../models/{{&path}}'
{{/imports}}

export class {{serviceUpperName}}WSService extends lib.WSServiceBase {
    //#region [ implement WSServiceBase ]
    public readonly name = '{{serviceName}}'
    //#endregion

    //#region [ hub ]
    {{#hubEvents}}

    // isAuth: {{isAuth}}
    public readonly {{name}} = new {{notification}}{{&arguments}}( this._hub, this.name, '{{name}}' )
    {{/hubEvents}}
    //#endregion

    //#region [ rest ]
    {{#restMethods}}

    // isAuth: {{isAuth}}
    {{#methodParams.length}}
    public {{name}} ( {{&methodParams}} ): Promise{{&returnType}} {
        return this.request{{&returnType}}( '{{name}}', {{&requestParams}})
    }
    {{/methodParams.length}}  
    {{^methodParams.length}}
    public {{name}} ( ): Promise{{&returnType}} {
        return this.request{{&returnType}}( '{{name}}', {{&requestParams}})
    }
    {{/methodParams.length}}  
    {{/restMethods}}
    //#endregion
}

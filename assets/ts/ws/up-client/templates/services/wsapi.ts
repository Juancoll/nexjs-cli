import { lib } from '../'

{{#services}}
import { {{serviceUpperName}}WSService } from './services/{{serviceUpperName}}WSService'
{{/services}}

export class WSApi<TUser, Token> extends lib.WSApiBase<TUser, Token> {
    {{#services}}
    public readonly {{serviceName}} = new {{serviceUpperName}}WSService ( this.rest, this.hub )
    {{/services}}

    constructor ( ws: lib.IWSBase ){
        super( ws )
    }
}

import { WSApiBase, IWSBase } from '@nexjs/wsclient'

{{#services}}
import { {{serviceUpperName}}WSService } from './services/{{serviceUpperName}}WSService'
{{/services}}

export class WSApi<TUser, Token> extends WSApiBase<TUser, Token> {
    {{#services}}
    public readonly {{serviceName}} = new {{serviceUpperName}}WSService ( this.rest, this.hub )
    {{/services}}

    constructor ( ws: IWSBase ){
        super( ws )
    }
}

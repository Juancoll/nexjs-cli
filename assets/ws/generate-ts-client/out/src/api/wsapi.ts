import { WSClientBase } from '../lib';
{{#services}}
import { {{service.upper}}WSService } from './services/{{service.upper}}WSService';
{{/services}}
export class WSApi extends WSClientBase {
    {{#services}}
    public {{service.name}} = new {{service.upper}}WSService(this.rest, this.hub);
    {{/services}}
}

import { WSClientBase } from '../lib';

{{#services}}
import { {{serviceUpperName}}WSService } from './services/{{serviceUpperName}}WSService';
{{/services}}

export class WSApi extends WSClientBase {
    {{#services}}
    public readonly {{serviceName}} = new {{serviceUpperName}}WSService(this.rest, this.hub);
    {{/services}}
}

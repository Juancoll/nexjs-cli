import { WSServiceBase } from '../../lib';
{{#typesToImport.items}}
import { {{import.strType}} } from '{{&import.targetPath}}';
{{/typesToImport.items}}

export class {{service.upper}}WSService extends WSServiceBase {
    public readonly name = '{{service.name}}';

    //#region [ hub ]
    {{#hub}}
    public {{event}} = this.newEvent<{{credentials.strType}}, {{data.strType}}>('{{event}}');
    {{/hub}}
    //#endregion

    //#region [ rest ]
    {{#rest}}
    public {{method}}({{&strMethodParams}}) { return this.request<{{returnType.strType}}>( '{{method}}', {{&strRequestArgs}} ); }
    {{/rest}}
    //#endregion
}

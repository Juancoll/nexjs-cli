import { WSService } from '../../lib';
{{#typesToImport.items}}
import { {{import.strType}} } from '{{&import.targetPath}}';
{{/typesToImport.items}}

export class {{service.upper}}WSService extends WSService {
    public readonly name = '{{service.name}}';

    //#region [ hub ]
    {{#hub}}
    public {{event}} = this.newEvent<{{credentials.strType}}, {{data.strType}}>('{{event}}');
    {{/hub}}
    //#endregion

    //#region [ rest ]
    {{#rest}}
    public {{method}}({{&strMethodParams}}) { return this.request<{{returnType.strType}}>({ {{&strRequestArgs}} }); }
    {{/rest}}
    //#endregion
}

{{#imports}}
import { {{&type}} } from './{{&type}}';
{{/imports}}

export class {{&declaration}} {
    {{#properties}}
    public {{&name}}: {{&type}};
    {{/properties}}

    {{#tsConstructor}}
    {{&tsConstructor}}
    {{/tsConstructor}}
    {{^tsConstructor}}
    constructor(init?: Partial<{{&constructorPartialArgument}}>) { {{&constructorSuperCall}} Object.assign(this, init); }
    {{/tsConstructor}}


    {{#codeToInclude.length}}
    //#region [ Included Methods ]
    {{#codeToInclude}}
    {{&.}}
    {{/codeToInclude}}
    //#rendregion
    {{/codeToInclude.length}}
}

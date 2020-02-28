{{#imports}}
import { {{&type}} } from './{{&type}}';
{{/imports}}

export class {{&declaration}} {
    {{#properties}}
    public {{&name}}: {{&type}};
    {{/properties}}

    constructor(init?: Partial<{{&constructorPartialArgument}}>) { {{&constructorSuperCall}} Object.assign(this, init); }
}

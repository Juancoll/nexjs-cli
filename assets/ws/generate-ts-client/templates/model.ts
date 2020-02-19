{{#imports}}
import { {{&type}} } from '{{&path}}';
{{/imports}}

export class {{&declaration}} 
{
    {{#properties}}
    public {{&name}}: {{&type}};
    {{/properties}}
}
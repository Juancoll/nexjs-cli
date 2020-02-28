import { ConverterBase } from '../../base/ConverterBase';
import { TSConverter } from '../TSConverter';
import { RType } from 'src/services/ws/models/base/RType';

export class TSTypeDefaultValue extends ConverterBase<TSConverter, RType, string>{

    //#region [ implement IConverter ]
    convert(input: RType): string {

        if (!input) { return 'undefined'; }
        if (input.name == "any") { return 'any' }
        if (input.name == "string") { return '"My string"' }
        if (input.name == "number") { return '2020'; }
        if (input.name == "bool") { return 'true'; }
        if (input.isArray) { return `[${this.convert(input.arguments[0])}]`; }
        if (input.declaration) {
            //return `new ${input.name}({ ${input.declaration.properties.map(x => `${x.name}: ${this.convert(x.type)}`).join(', ')} })`;
            return `new ${input.name}()`;
        }

        return 'undefined';
    }
    //#endregion
}
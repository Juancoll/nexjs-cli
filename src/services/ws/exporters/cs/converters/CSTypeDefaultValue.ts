import { RType } from '../../../models/base/RType'
import { ConverterBase } from '../../base/ConverterBase'
import { CSConverter } from '../CSConverter'

export class CSTypeDefaultValue extends ConverterBase<CSConverter, RType, string>{

    //#region [ implement IConverter ]
    convert ( input: RType ): string {

        if ( !input ) { return 'null' }
        if ( input.name == 'any' ) { return '{}' }
        if ( input.name == 'string' ) { return '\\"My string\\"' }
        if ( input.name == 'number' ) { return '2020' }
        if ( input.name == 'bool' ) { return 'true' }
        if ( input.isArray ) { return `[${this.convert( input.arguments[0] )}]` }
        if ( input.declaration ) { return '{}' }

        return 'null'
    }
    //#endregion
}
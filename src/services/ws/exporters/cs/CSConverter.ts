import { CSModelConverter } from './converters/CSModelConverter'
import { CSWSServiceConterter } from './converters/CSWSServiceConterter'
import { RType } from '../../models/base/RType'
import { CSHubConverter } from './converters/CSWSHubConverter'
import { CSRestConverter } from './converters/CSWSRestConverter'
import { CSWSApiConverter } from './converters/CSWSApiConverter'
import { CSTypeDefaultValue } from './converters/CSTypeDefaultValue'

export class CSConverter {

    //#region [ converters ]
    public readonly Model = new CSModelConverter( this );
    public readonly WSRest = new CSRestConverter( this );
    public readonly WSHub = new CSHubConverter( this );
    public readonly WSService = new CSWSServiceConterter( this );
    public readonly WSApi = new CSWSApiConverter( this );
    public readonly TypeDefaultValue = new CSTypeDefaultValue( this );
    //#endregion

    //#region [ commons ]
    public getTypeInstanceName ( t: RType ): string {
        if ( t.isArray ) {
            return `List<${this.getTypeInstanceName( t.arguments[0] )}>`
        } else {
            let result = t.name
            if ( t.arguments.length > 0 ) {
                result += `<${t.arguments.map( x => this.getTypeInstanceName( x ) ).join( ',' )}>`
            }
            result = result.split( 'number' ).join( 'double' )
            result = result.split( 'boolean' ).join( 'bool' )
            result = result.split( 'any' ).join( 'object' )
            return result
        }
    }
    //#endregion
}
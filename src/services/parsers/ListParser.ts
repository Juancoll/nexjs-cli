import { IParser } from './base/IParser'

export class ListParser implements IParser<string, any[]>{

    constructor (
        public separator: string = ','
    ) { }

    parse ( value: string ): any {
        if ( !value ) return undefined
        else if ( value.indexOf( this.separator ) != -1 ) {
            let result: any = {}
            const keyValues = value.split( this.separator )
            keyValues.forEach( x => {
                result = Object.assign( result, this.parse( x ) )
            } )
            return result
        } else {
            if ( value.toLowerCase() == 'true' ) {
                return true
            } else if ( value.toLowerCase() == 'false' ) {
                return false
            } else if ( !isNaN( value as any ) ) {
                return +value
            } else
                return value
        }
    }
}
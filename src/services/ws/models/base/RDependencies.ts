import { RType } from './RType'

export class RDependencies {
    private _types: RType[] = [];

    addType ( value: RType ): void {
        if ( value && !value.isPrimitive ) {
            if ( !this._types.find( x => value.name == x.name && value.sourceFile == x.sourceFile ) ) {
                if ( value.declaration ) {
                    this._types.push( value )
                }
                this.addTypes( value.getDependencies() )
            }
        }
    }
    addTypes ( values: RType[] ): void {
        values.forEach( x => this.addType( x ) )
    }

    get (): RType[] {
        return this._types
    }
}
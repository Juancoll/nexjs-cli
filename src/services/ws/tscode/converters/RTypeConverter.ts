import { Type } from 'ts-morph'
import { RType } from '../../models/base/RType'
import { CodeConverterBase } from '../base/CodeConverterBase'
import { TSCode } from '../TSCode'

export class RTypeConverter extends CodeConverterBase<Type, RType> {

    //#region [ implements CodeConverterBase ]
    public convert ( input: Type ): RType {
        const output = new RType()

        output.isPrimitive = this.isPrimitive( input )
        output.isArray = input.isArray()
        output.name = input.isArray()
            ? 'Array'
            : this.getTextType( input )
        output.arguments = input.getTypeArguments().map( x => this.convert( x ) )

        if ( !output.isPrimitive ) {

            output.sourceFile = this.getImportFile( input )
            if ( output.sourceFile ) {
                if ( input.isUnion() ){
                    input = input.getUnionTypes().find( x => !x.isNull() && !x.isUndefined() )

                }

                output.declaration = this.ts.RTypeDeclaration.convert( {
                    isInterface: input.isInterface(),
                    name: input.isArray()
                        ? this.getTextType( input.getArrayElementType() )
                        : this.getTextType( input ),
                    sourceFile: output.sourceFile,
                } )
            }
        }
        return output
    }
    //#endregion

    //#region [ constructor ]
    constructor ( ts: TSCode ) {
        super( ts )
    }
    //#endregion

    //#region [ private ]
    private isPrimitive ( t: Type ): boolean {
        return !this.isImport( t ) && !t.isArray() && !t.getText().startsWith( 'Promise' )
    }

    private isImport ( t: Type ): boolean {
        try {
            return t.getText().startsWith( 'import("' )
        } catch ( err ) {
            console.log( err )
        }
    }
    private getImportFile ( t: Type ): string | undefined {
        const str = this.getImportString( t )
        return str
            ? str + '.ts'
            : undefined
    }
    private getImportString ( t: Type ): string | undefined {
        if ( !this.isImport( t ) ) {
            return undefined
        } else {
            const withQuotes = t.getText().match( /\".*?\"/ )[0]
            return withQuotes.split( '"' ).join( '' )
        }
    }
    private getTextWithoutImport ( t: Type ): string {
        const text = t.getText()
        const result = text.split( /import\(\".*?\"\)\./ ).join( '' )
        return result
    }
    private getTextType ( t: Type ): string {
        let str = this.getTextWithoutImport( t )
        if ( t.isArray() ) {
            if ( str.endsWith( '[]' ) ) {
                str = str.substr( 0, str.length - 2 )
            }
            if ( str.startsWith( 'Array<' ) ) {
                str = str.substr( 6, str.length - 6 - 1 )
            }
        } else if ( t.getTypeArguments().length > 0 ) {
            const idxStart = str.indexOf( '<' )
            str = str.substr( 0, idxStart )
        }
        return str
    }
    //#endregion
}
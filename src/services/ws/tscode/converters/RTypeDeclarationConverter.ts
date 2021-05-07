import { CodeConverterBase } from '../base/CodeConverterBase'
import { RTypeDeclaration } from '../../models/base/RTypeDeclaration'
import { TSCode } from '../TSCode'
import { ClassDeclaration, InterfaceDeclaration, PropertyDeclaration, ObjectLiteralExpression } from 'ts-morph'
import { RDecorator } from '../../models/base/RDecorator'

export class RTypeDeclarationInput {
    isInterface: boolean;
    name: string;
    sourceFile: string;
}

export class RTypeDeclarationConverter extends CodeConverterBase<RTypeDeclarationInput, RTypeDeclaration> {

    //#region [ implements CodeConverterBase ]
    convert ( input: RTypeDeclarationInput ): RTypeDeclaration {
        const sourceFile = this.ts.project.getSourceFile( input.sourceFile )
        if ( !sourceFile ){
            return undefined
        }

        const output = input.isInterface
            ? this.convertFromInterface( sourceFile.getInterfaces().find( x => x.getName() == input.name ) )
            : this.convertFromClass( sourceFile.getClasses().find( x => x.getName() == input.name ) )

        output.codeToInclude = input.isInterface
            ? undefined
            : this.getIncludedCode( sourceFile.getClasses().find( x => x.getName() == input.name ) )

        output.tsConstructor = input.isInterface
            ? undefined
            : this.getConstructor( sourceFile.getClasses().find( x => x.getName() == input.name ) )

        return output
    }
    //#endregion

    //#region [ constructor ]
    constructor ( ts: TSCode ) {
        super( ts )
    }
    //#endregion

    convertFromClass ( declaration?: ClassDeclaration ): RTypeDeclaration {
        if ( !declaration ) {
            throw new Error( 'Class Not found' )
        }
        const output = new RTypeDeclaration()
        output.name = declaration.getName()
        output.sourceFile = declaration.getSourceFile().getFilePath()
        output.baseType = declaration.getBaseClass()
            ? this.ts.RType.convert( declaration.getBaseClass().getType() )
            : undefined

        output.arguments = declaration.getTypeParameters().map( x => this.ts.RType.convert( x.getType() ) )
        output.properties = declaration.getProperties().map( x => ( {
            name: x.getName(),
            type: this.ts.RType.convert( x.getType() ),
            decorators: this.getPropertyDecorators( x ),
            token: x.hasExclamationToken()
                ? '!'
                : undefined,
        } ) )

        return output
    }

    convertFromInterface ( declaration: InterfaceDeclaration ): RTypeDeclaration {
        if ( !declaration ) {
            throw new Error( 'Interface Not found' )
        }

        const output = new RTypeDeclaration()
        output.name = declaration.getName()
        output.sourceFile = declaration.getSourceFile().getFilePath()
        output.baseType = undefined
        output.arguments = []
        output.properties = declaration.getProperties().map( x => ( {
            name: x.getName(),
            type: this.ts.RType.convert( x.getType() ),
            decorators: new Array<RDecorator>(),
            token: x.hasQuestionToken()
                ? '?'
                : undefined,
        } ) )
        return output
    }

    getConstructor ( declaration: ClassDeclaration ): string | undefined {
        if ( declaration.getConstructors().length == 0 ){
            return undefined
        }
        return declaration.getConstructors()[0].getText()
    }
    getIncludedCode ( declaration: ClassDeclaration ): string[] | undefined {
        const results: string[] = []
        declaration.getMethods().forEach( method => {
            method.getDecorators().forEach( deco => {
                if ( deco.getName() == 'IncludeMethod' ) {
                    const text = this.removeDecorator( method.getText() )
                    results.push( text )
                }
            } )
        } )
        return results.length == 0
            ? undefined
            : results
    }

    private getPropertyDecorators ( p: PropertyDeclaration ): RDecorator[] {
        return p.getDecorators().map( decorator => {
            const hasArg = decorator.getArguments().length > 0
            let options = undefined
            if ( hasArg ) {
                const arg = decorator.getArguments()[0] as ObjectLiteralExpression
                try {
                    options = eval( `Object.assign(${arg.getText()})` )
                } catch ( err ) {
                    console.log( `[error][RTypeDeclarationConverter] getPropertyDecorators(...): Model: ${p.getParent().getName()}, property: ${p.getName()}, decorator: '${decorator.getName()}', error: ${err.message}` )
                }
            }
            return new RDecorator( {
                name: decorator.getName(),
                options: hasArg
                    ? options
                    : undefined,
            } )
        } )
    }
    private removeDecorator ( text: string ): string {
        let newText = text.replace( '@IncludeMethod()', '' ) // remove decorator
        newText = newText.replace( /^\s*\n/g, '' ) // remove white lines.
        return newText
    }
}
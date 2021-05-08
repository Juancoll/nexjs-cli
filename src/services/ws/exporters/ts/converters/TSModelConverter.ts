import { RParam } from '../../../models/base/RParam'
import { RTypeDeclaration } from '../../../models/base/RTypeDeclaration'
import { ConverterBase } from '../../base/ConverterBase'
import { TSConverter } from '../TSConverter'

export interface ITSImport {
    type: string;
    path: string;
}

export interface ITSModelProperty {
    name: string;
    type: string;
    token?: string;
}

export interface ITSModelView {
    imports: ITSImport[];
    name: string;
    constructorPartialArgument: string;
    constructorSuperCall: string;
    declaration: string;
    properties: ITSModelProperty[];
    codeToInclude: string[] | undefined;
    tsConstructor: string | undefined;
}

export class TSModelConverter extends ConverterBase<TSConverter, RTypeDeclaration, ITSModelView>{

    //#region [ implement IConverter ]
    convert ( input: RTypeDeclaration ): ITSModelView {
        return {
            imports: this.getImports( input ),
            name: input.name,
            constructorPartialArgument: this.getConstructorPartialArgument( input ),
            constructorSuperCall: this.getConstructorSuperCall( input ),
            declaration: this.getDeclaration( input ),
            properties: input.properties.map( x => this.getProperty( x ) ),
            codeToInclude: input.codeToInclude,
            tsConstructor: input.tsConstructor,
        }
    }
    //#endregion

    //#region [ constructor ]
    constructor ( parent: TSConverter ) {
        super( parent )
    }
    //#endregion

    //#region  [ private ]
    private getImports ( d: RTypeDeclaration ): ITSImport[] {
        const dependencies = d.getDependencies()
        return dependencies.map( x =>{
            return {
                type: x.declaration.name,
                path: `./${x.declaration.name}`,
            }
        } )
    }
    private getConstructorPartialArgument ( d: RTypeDeclaration ): string {
        let result = d.name
        if ( d.arguments.length > 0 ) {
            result += `<${d.arguments.map( x => this.parent.getTypeInstanceName( x ) ).join( ',' )}>`
        }
        return result
    }
    private getConstructorSuperCall ( d: RTypeDeclaration ): string {
        let result = ''
        if ( d.baseType ) {
            result = 'super(); '
        }
        return result
    }
    private getDeclaration ( d: RTypeDeclaration ): string {
        let result = d.name
        if ( d.arguments.length > 0 ) {
            result += `<${d.arguments.map( x => this.parent.getTypeInstanceName( x ) ).join( ',' )}>`
        }
        if ( d.baseType ) {
            result += ` extends ${this.parent.getTypeInstanceName( d.baseType )}`
        }
        return result
    }
    private getProperty ( p: RParam ): ITSModelProperty {
        return {
            name: p.name,
            type: this.getPropertyType( p ),
            token: p.token,
        }
    }
    private getPropertyType ( p: RParam ): string {
        return this.parent.getTypeInstanceName( p.type )
    }
    //#endregion
}
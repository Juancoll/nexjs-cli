import {
    ClassDeclaration,
    ObjectLiteralExpression,
    SignaturedDeclaration,
    ObjectLiteralElement,
    StringLiteral,
    BooleanLiteral,
    ArrayLiteralExpression,
    Decorator,
    MethodDeclaration,
} from 'ts-morph'
import { TSCode } from '../TSCode'
import { CodeConverterBase } from '../base/CodeConverterBase'
import { WSRestMethod } from '../../models/ws/WSRestMethod'
import { WSRestDecoratorOptions } from '../../models/ws/decorators/WSRestDecoratorOptions'
import { RDecorator } from '../../models/base/RDecorator'
import { RType } from '../../models/base/RType'
import { RParam } from '../../models/base/RParam'

export class WSHRestEventConverter extends CodeConverterBase<MethodDeclaration, WSRestMethod> {

    //#region [ implements CodeConverterBase ]
    public convert ( input: MethodDeclaration ): WSRestMethod {
        const output: WSRestMethod = new WSRestMethod( {
            name: input.getName(),
            params: this.extractParams( input ),
            returnType: this.ts.RType.convert( input.getReturnType() ),
            options: this.extractHubDecoratorOptions( input ),
            decorators: this.extractDecorators( input ),
        } )
        return output
    }
    //#endregion

    //#region [ constructor ]
    constructor ( ts: TSCode ) {
        super( ts )
    }
    //#endregion

    //#region [ public ]
    public isRest ( method: MethodDeclaration ): boolean {
        return method.getDecorators().find( x => x.getName() == 'Rest' ) != undefined
    }
    //#endregion

    //#region [ private ]
    private extractServiceName ( method: MethodDeclaration, options: ObjectLiteralExpression ): string {
        const serviceProp = options ? options.getProperty( 'name' ) : undefined
        return serviceProp
            ? this.getStringLiteral( serviceProp )
            : method.getParent().getProperty( 'name' ).getType().getText().replace( /^"(.*)"$/, '$1' )
    }
    private extractHubDecoratorOptions ( method: MethodDeclaration ): WSRestDecoratorOptions {
        const decorator = method.getDecorators().find( x => x.getName() == 'Rest' )
        if ( !decorator ) {
            throw new Error( 'property is not decorated with hub' )
        }

        const options = decorator.getArguments()[0] as ObjectLiteralExpression
        const service = this.extractServiceName( method, options )
        const isAuthProp = options ? options.getProperty( 'isAuth' ) : undefined
        const rolesProp = options ? options.getProperty( 'roles' ) : undefined

        return {
            service,
            isAuth: isAuthProp
                ? this.getBooleanLiteral( isAuthProp )
                : false,
            roles: rolesProp
                ? this.getStringArrayLiteral( rolesProp )
                : [],
            credentials: this.extractValidationCredentialsType( decorator ),
        }
    }
    private extractValidationCredentialsType ( decorator: Decorator ): RType | undefined {
        const options = decorator.getArguments()[0] as ObjectLiteralExpression
        const validation = options ? options.getProperty( 'validation' ) : undefined
        if ( !validation ) {
            return undefined
        } else {
            const credentialsParamIdx = 2
            const functionType = ( validation.getType().getCallSignatures()[0].getDeclaration() as SignaturedDeclaration )
            if ( functionType.getParameters().length < credentialsParamIdx + 1 ) {
                return undefined
            } else {
                const type = functionType.getParameters()[credentialsParamIdx].getType()
                return this.ts.RType.convert( type )
            }
        }
    }
    private extractDecorators ( method: MethodDeclaration ): RDecorator[] {
        const result = new Array<RDecorator>()
        const decorators = method.getDecorators().filter( x => x.getName() != 'Rest' )
        decorators.forEach( decorator => {
            if ( decorator.getArguments().length == 0 ) {
                result.push( new RDecorator( { name: decorator.getName() } ) )
            } else {
                const modelName = ( method.getParent() as ClassDeclaration ).getName()
                const propertyName = method.getName()
                const decoratorName = decorator.getName()
                const options = decorator.getArguments()[0] as ObjectLiteralExpression
                const optionsStr = options.getText()
                try {
                    const optionsObj = eval( `Object.assign(${optionsStr})` )
                    result.push( new RDecorator( { name: decoratorName, options: optionsObj } ) )
                } catch ( err ) {

                    console.log( `[err][WSHRestEventConverter] extractDecorators(...): model: ${modelName}, property: ${propertyName}, decorator: ${decoratorName}, err: ${err.message}` )
                }
            }
        } )
        return result
    }
    //#endregion

    //#region [ Params ]
    private extractParams ( method: MethodDeclaration ): RParam[] {
        let result = new Array<RParam>()
        method.getParameters().forEach( param => {
            const decorator = param.getDecorators().find( x => x.getName() == 'Data' )
            if ( decorator ) {
                const paramDecorator = new RDecorator( { name: decorator.getName() } )
                const options = decorator.getArguments()[0]
                if ( options ) {
                    paramDecorator.options = ( options as StringLiteral ).getLiteralValue()
                    result.push( new RParam( {
                        name: paramDecorator.options,
                        type: this.ts.RType.convert( param.getType() ),
                        decorators: [paramDecorator],
                    } ) )
                } else {
                    result.push( new RParam( {
                        name: param.getName(),
                        type: this.ts.RType.convert( param.getType() ),
                        decorators: [paramDecorator],
                    } ) )
                }

            }
        } )

        // exist param Data with no args. Means that's the unic real param to send
        // all params have a uniq decorator Data
        const rootDataParam = result.find( x => !x.decorators[0].options )
        if ( rootDataParam ) {
            result = [rootDataParam]
        }
        return result
    }
    //#endregion

    //#region  [ literals ]
    private getStringLiteral ( literal: ObjectLiteralElement ): string {
        return ( literal.getChildren()[2] as StringLiteral ).getLiteralValue()
    }
    private getBooleanLiteral ( literal: ObjectLiteralElement ): boolean {
        return ( literal.getChildren()[2] as BooleanLiteral ).getLiteralValue()
    }
    private getStringArrayLiteral ( literal: ObjectLiteralElement ): string[] {
        return eval( ( literal.getChildren()[2] as ArrayLiteralExpression ).getText() ) as string[]
    }
    //#endregion
}
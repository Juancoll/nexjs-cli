import {
    PropertyDeclaration,
    ObjectLiteralExpression,
    SignaturedDeclaration,
    ObjectLiteralElement,
    StringLiteral,
    BooleanLiteral,
    ArrayLiteralExpression,
    Decorator,
} from 'ts-morph'
import { WSHubEvent, HubEventType } from '../../models/ws/WSHubEvent'
import { RType } from '../../models/base/RType'
import { WSHubDecoratorOptions } from '../../models/ws/decorators/WSHubDecoratorOptions'
import { TSCode } from '../TSCode'
import { CodeConverterBase } from '../base/CodeConverterBase'
import { RDecorator } from '../../models/base/RDecorator'

export class WSHubEventConverter extends CodeConverterBase<PropertyDeclaration, WSHubEvent> {

    //#region [ implements CodeConverterBase ]
    public convert ( input: PropertyDeclaration ): WSHubEvent {
        this.check( input )
        const output: WSHubEvent = new WSHubEvent( {
            eventType: this.getEventType( input ),
            name: input.getName(),
            dataType: this.getDataType( input ),
            selectionType: this.getSelectionType( input ),
            valiationType: this.getValidationType( input ),
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
    public isHub ( property: PropertyDeclaration ): boolean {
        return property.getDecorators().find( x => x.getName() == 'Hub' ) != undefined
    }
    //#endregion

    //#region [ private ]
    private check ( property: PropertyDeclaration ): void {
        const decorator = property.getDecorators().find( x => x.getName() == 'Hub' )
        const type = this.ts.RType.convert( property.getType() )
        if ( !HubEventType[type.name] && decorator ) {
            const m = property.getParent().getName()
            const p = property.getName()
            throw new Error( `[WSHubEventConverter] check(...): model: ${m}, prop: ${p}: invalid type ${type.name} with @Hub decorator` )
        }
    }
    private getEventType ( property: PropertyDeclaration ): HubEventType{
        const type = this.ts.RType.convert( property.getType() )
        return HubEventType[type.name]
    }
    private extractServiceName ( property: PropertyDeclaration, options: ObjectLiteralExpression ): string {
        const serviceProp = options ? options.getProperty( 'name' ) : undefined
        return serviceProp
            ? this.getStringLiteral( serviceProp )
            : property.getParent().getProperty( 'name' ).getType().getText().replace( /^"(.*)"$/, '$1' )
    }
    private extractHubDecoratorOptions ( property: PropertyDeclaration ): WSHubDecoratorOptions {
        const decorator = property.getDecorators().find( x => x.getName() == 'Hub' )
        if ( !decorator ) {
            throw new Error( 'property is not decorated with hub' )
        }

        const options = decorator.getArguments()[0] as ObjectLiteralExpression
        const service = this.extractServiceName( property, options )
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
        }
    }
    private getDataType ( property: PropertyDeclaration ): RType | undefined {
        const type = this.ts.RType.convert( property.getType() )
        switch ( type.name ) {
        case HubEventType.HubEvent: return undefined
        case HubEventType.HubEventSelector: return undefined
        case HubEventType.HubEventSelectorData: return this.ts.RType.convert( property.getType().getTypeArguments()[2] )
        case HubEventType.HubEventData: return this.ts.RType.convert( property.getType().getTypeArguments()[0] )
        }
    }
    private getValidationType ( property: PropertyDeclaration ): RType | undefined {
        const type = this.ts.RType.convert( property.getType() )
        switch ( type.name ) {
        case HubEventType.HubEvent: return undefined
        case HubEventType.HubEventSelector: return this.ts.RType.convert( property.getType().getTypeArguments()[0] )
        case HubEventType.HubEventSelectorData: return this.ts.RType.convert( property.getType().getTypeArguments()[0] )
        case HubEventType.HubEventData: undefined
        }
    }
    private getSelectionType ( property: PropertyDeclaration ): RType | undefined {
        const type = this.ts.RType.convert( property.getType() )
        switch ( type.name ) {
        case HubEventType.HubEvent: return undefined
        case HubEventType.HubEventSelector: return this.ts.RType.convert( property.getType().getTypeArguments()[1] )
        case HubEventType.HubEventSelectorData: return this.ts.RType.convert( property.getType().getTypeArguments()[1] )
        case HubEventType.HubEventData: undefined
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
    private extractDecorators ( property: PropertyDeclaration ): RDecorator[] {
        const result = new Array<RDecorator>()
        const decorators = property.getDecorators().filter( x => x.getName() != 'Hub' )
        decorators.forEach( decorator => {
            if ( decorator.getArguments().length == 0 ) {
                result.push( new RDecorator( { name: decorator.getName() } ) )
            } else {
                const modelName = property.getParent().getName()
                const propertyName = property.getName()
                const decoratorName = decorator.getName()
                const options = decorator.getArguments()[0] as ObjectLiteralExpression
                const optionsStr = options.getText()
                try {
                    const optionsObj = eval( `Object.assign(${optionsStr})` )
                    result.push( new RDecorator( { name: decoratorName, options: optionsObj } ) )
                } catch ( err ) {

                    console.log( `[err][WSHubEventConverter] extractDecorators(...): model: ${modelName}, property: ${propertyName}, decorator: ${decoratorName}, err: ${err.message}` )
                }
            }
        } )
        return result
    }
    //#endregion

    //#region  [ literals ]
    private getStringLiteral ( literal: ObjectLiteralElement ): string {
        return ( literal.getChildren()[2] as StringLiteral ).getLiteralValue()
    }
    private getBooleanLiteral ( literal: ObjectLiteralElement ): boolean{
        return ( literal.getChildren()[2] as BooleanLiteral ).getLiteralValue()
    }
    private getStringArrayLiteral ( literal: ObjectLiteralElement ): string[] {
        return eval( ( literal.getChildren()[2] as ArrayLiteralExpression ).getText() ) as string[]
    }
    //#endregion
}
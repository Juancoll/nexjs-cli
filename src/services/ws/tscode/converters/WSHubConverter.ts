import {
    PropertyDeclaration,
    ObjectLiteralExpression,
    SignaturedDeclaration,
    ObjectLiteralElement,
    StringLiteral,
    BooleanLiteral,
    ArrayLiteralExpression,
    Decorator,
} from 'ts-morph';
import { WSHubEvent } from '../../models/ws/WSHubEvent';
import { RType } from '../../models/base/RType';
import { WSHubDecoratorOptions } from '../../models/ws/decorators/WSHubDecoratorOptions';
import { TSCode } from '../TSCode';
import { CodeConverterBase } from '../base/CodeConverterBase';
import { RDecorator } from '../../models/base/RDecorator';

enum Hubevents {
    'HubEvent' = 'HubEvent',
    'HubEventCredentials' = 'HubEventCredentials',
    'HubEventCredentialsData' = 'HubEventCredentialsData',
    'HubEventData' = 'HubEventData'
}

export class WSHubEventConverter extends CodeConverterBase<PropertyDeclaration, WSHubEvent> {

    //#region [ implements CodeConverterBase ]
    public convert(input: PropertyDeclaration): WSHubEvent {
        this.check(input);
        let output: WSHubEvent = new WSHubEvent({
            name: input.getName(),
            data: this.getData(input),
            options: this.extractHubDecoratorOptions(input),
            decorators: this.extractDecorators(input),
        });
        return output;
    }
    //#endregion

    //#region [ constructor ]
    constructor(ts: TSCode) {
        super(ts);
    }
    //#endregion

    //#region [ public ]
    public isHub(property: PropertyDeclaration) {
        return property.getDecorators().find(x => x.getName() == 'Hub');
    }
    //#endregion

    //#region [ private ]
    private check(property: PropertyDeclaration): void {
        const decorator = property.getDecorators().find(x => x.getName() == 'Hub');
        var type = this.ts.RType.convert(property.getType());
        if (!Hubevents[type.name] && decorator) {
            const m = property.getParent().getName();
            const p = property.getName();
            throw new Error(`[WSHubEventConverter] check(...): model: ${m}, prop: ${p}: invalid type ${type.name} with @Hub decorator`);
        }
    }
    private extractServiceName(property: PropertyDeclaration, options: ObjectLiteralExpression): string {
        const serviceProp = options ? options.getProperty('name') : undefined;
        return serviceProp
            ? this.getStringLiteral(serviceProp)
            : property.getParent().getProperty('name').getType().getText().replace(/^"(.*)"$/, '$1');
    }
    private extractHubDecoratorOptions(property: PropertyDeclaration): WSHubDecoratorOptions {
        const decorator = property.getDecorators().find(x => x.getName() == 'Hub');
        if (!decorator) {
            throw new Error('property is not decorated with hub');
        }

        const options = decorator.getArguments()[0] as ObjectLiteralExpression;
        const service = this.extractServiceName(property, options);
        const isAuthProp = options ? options.getProperty('isAuth') : undefined;
        const rolesProp = options ? options.getProperty('roles') : undefined;

        return {
            service,
            isAuth: isAuthProp
                ? this.getBooleanLiteral(isAuthProp)
                : false,
            roles: rolesProp
                ? this.getStringArrayLiteral(rolesProp)
                : [],
            credentials: this.extractValidationCredentialsType(decorator),
        };
    }
    private getData(property: PropertyDeclaration): RType | undefined {
        var type = this.ts.RType.convert(property.getType());
        switch (type.name) {
            case Hubevents.HubEvent: return undefined;
            case Hubevents.HubEventCredentials: return undefined;
            case Hubevents.HubEventCredentialsData: return this.ts.RType.convert(property.getType().getTypeArguments()[1]);;
            case Hubevents.HubEventData: return this.ts.RType.convert(property.getType().getTypeArguments()[0]);;
        }
    }
    private extractValidationCredentialsType(decorator: Decorator): RType | undefined {
        const options = decorator.getArguments()[0] as ObjectLiteralExpression;
        const validation = options ? options.getProperty('validation') : undefined;
        if (!validation) {
            return undefined;
        } else {
            const credentialsParamIdx = 2;
            const functionType = (validation.getType().getCallSignatures()[0].getDeclaration() as SignaturedDeclaration);
            if (functionType.getParameters().length < credentialsParamIdx + 1) {
                return undefined;
            } else {
                const type = functionType.getParameters()[credentialsParamIdx].getType();
                return this.ts.RType.convert(type);
            }
        }
    }
    private extractDecorators(property: PropertyDeclaration): RDecorator[] {
        const result = new Array<RDecorator>();
        var decorators = property.getDecorators().filter(x => x.getName() != 'Hub');
        decorators.forEach(decorator => {
            if (decorator.getArguments().length == 0) {
                result.push(new RDecorator({ name: decorator.getName() }));
            } else {
                const modelName = property.getParent().getName();
                const propertyName = property.getName();
                const decoratorName = decorator.getName();
                let options = decorator.getArguments()[0] as ObjectLiteralExpression;
                let optionsStr = options.getText();
                try {
                    let optionsObj = eval(`Object.assign(${optionsStr})`);
                    result.push(new RDecorator({ name: decoratorName, options: optionsObj }));
                } catch (err) {

                    console.log(`[err][WSHubEventConverter] extractDecorators(...): model: ${modelName}, property: ${propertyName}, decorator: ${decoratorName}, err: ${err.message}`);
                }
            }
        });
        return result;
    }
    //#endregion    

    //#region  [ literals ]
    private getStringLiteral(literal: ObjectLiteralElement) {
        return (literal.getChildren()[2] as StringLiteral).getLiteralValue();
    }
    private getBooleanLiteral(literal: ObjectLiteralElement) {
        return (literal.getChildren()[2] as BooleanLiteral).getLiteralValue();
    }
    private getStringArrayLiteral(literal: ObjectLiteralElement) {
        return eval((literal.getChildren()[2] as ArrayLiteralExpression).getText()) as string[];
    }
    //#endregion
}
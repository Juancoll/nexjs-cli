import {
    PropertyDeclaration,
    Decorator,
    ObjectLiteralExpression,
    StringLiteral,
    BooleanLiteral,
    ArrayLiteralExpression,
    ObjectLiteralElement,
    SignaturedDeclaration,
} from 'ts-morph';

import { TypeDescriptor } from './TypeDescriptor';
import { IServiceName } from './commons';

export interface IHubDecoratorDescriptor {
    tsDecorator: Decorator;
    service: string;
    isAuth: boolean;
    roles?: string[];
}
export interface IHubDescriptor {
    tsProperty: PropertyDeclaration;
    decorator: IHubDecoratorDescriptor;
    service: IServiceName;
    event: string;
    credentials: TypeDescriptor;
    data: TypeDescriptor;
}

export class HubDescriptor implements IHubDescriptor {

    //#region [ IHubDescriptor ]
    public readonly tsProperty: PropertyDeclaration;
    public readonly decorator: IHubDecoratorDescriptor;
    public readonly event: string;
    public readonly service: IServiceName;
    public readonly credentials: TypeDescriptor;
    public readonly data: TypeDescriptor;
    //#endregion

    //#region [ constructor ]
    constructor(property: PropertyDeclaration) {

        this.tsProperty = property;
        this.decorator = this.extractDecoratorDescriptor(property);
        this.event = property.getName();
        this.service = this.getServiceName(this.decorator);
        this.credentials = this.extractCredentialsType(this.decorator);
        this.data = this.getData(property);
    }
    //#endregion

    //#region [ private ]
    // service can't be optional
    // is if not defined extract from class property 'service' as string literal
    private extractServiceName(property: PropertyDeclaration, options: ObjectLiteralExpression): string {
        const serviceProp = options.getProperty('service');
        return serviceProp
            ? this.getStringLiteral(serviceProp)
            : property.getParent().getProperty('service').getType().getText().replace(/^"(.*)"$/, '$1');
    }
    private extractDecoratorDescriptor(property: PropertyDeclaration): IHubDecoratorDescriptor {
        const decorator = property.getDecorators().find(x => x.getName() == 'Hub');
        if (!decorator) {
            throw new Error('property is not decorated with hub');
        }

        const options = decorator.getArguments()[0] as ObjectLiteralExpression;
        const service = this.extractServiceName(property, options);
        const isAuthProp = options.getProperty('isAuth');
        const rolesProp = options.getProperty('roles');

        return {
            tsDecorator: decorator,
            service,
            isAuth: isAuthProp
                ? this.getBooleanLiteral(isAuthProp)
                : false,
            roles: rolesProp
                ? this.getStringArrayLiteral(rolesProp)
                : [],
        };
    }
    private getServiceName(decorator: IHubDecoratorDescriptor): IServiceName {
        return {
            name: decorator.service,
            upper: decorator.service.replace(/^\w/, c => c.toUpperCase()),
        };
    }
    private getStringLiteral(literal: ObjectLiteralElement) {
        return (literal.getChildren()[2] as StringLiteral).getLiteralValue();
    }
    private getBooleanLiteral(literal: ObjectLiteralElement) {
        return (literal.getChildren()[2] as BooleanLiteral).getLiteralValue();
    }
    private getStringArrayLiteral(literal: ObjectLiteralElement) {
        // tslint:disable-next-line: no-eval
        return eval((literal.getChildren()[2] as ArrayLiteralExpression).getText()) as string[];
    }
    private getCredentialsFromEvent(property: PropertyDeclaration): TypeDescriptor {
        return new TypeDescriptor(property.getType().getTypeArguments()[0]);
    }
    private extractCredentialsType(decorator: IHubDecoratorDescriptor): TypeDescriptor | undefined {
        const value = decorator.tsDecorator.getArguments()[0] as ObjectLiteralExpression;
        const validation = value.getProperty('validation');
        if (!validation) {
            return undefined;
        } else {
            const credentialsParamIdx = 2;
            const functionType = (validation.getType().getCallSignatures()[0].getDeclaration() as SignaturedDeclaration);
            if (functionType.getParameters().length < credentialsParamIdx + 1) {
                return undefined;
            } else {
                const type = functionType.getParameters()[credentialsParamIdx].getType();
                return new TypeDescriptor(type);
            }
        }
    }
    private getData(property: PropertyDeclaration): TypeDescriptor {
        return new TypeDescriptor(property.getType().getTypeArguments()[1]);
    }
    //#endregion

    //#region [ static ]
    public static isHub(property: PropertyDeclaration) {
        return property.getDecorators().find(x => x.getName() == 'Hub');
    }
    //#endregion
}

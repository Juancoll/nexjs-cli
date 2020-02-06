import {
    PropertyDeclaration,
    Decorator,
    ObjectLiteralExpression,
    StringLiteral,
    BooleanLiteral,
    ArrayLiteralExpression,
    ObjectLiteralElement,
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
        this.credentials = this.getCredentials(property);
        this.data = this.getData(property);
    }
    //#endregion

    //#region [ private ]
    private extractDecoratorDescriptor(property: PropertyDeclaration): IHubDecoratorDescriptor {
        const decorator = property.getDecorators().find(x => x.getName() == 'Hub');
        if (!decorator) {
            throw new Error('property is not decorated with hub');
        }

        const value = decorator.getArguments()[0] as ObjectLiteralExpression;
        const serviceProp = value.getProperty('service');
        const isAuthProp = value.getProperty('isAuth');
        const rolesProp = value.getProperty('roles');
        const selectionProp = value.getProperty('selection');
        const validationProp = value.getProperty('validation');

        return {
            tsDecorator: decorator,
            service: this.getStringLiteral(serviceProp),
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
    private getCredentials(property: PropertyDeclaration): TypeDescriptor {
        return new TypeDescriptor(property.getType().getTypeArguments()[0]);
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

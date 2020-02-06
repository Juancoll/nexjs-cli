import { PropertyDeclaration, Decorator } from 'ts-morph';
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
export declare class HubDescriptor implements IHubDescriptor {
    readonly tsProperty: PropertyDeclaration;
    readonly decorator: IHubDecoratorDescriptor;
    readonly event: string;
    readonly service: IServiceName;
    readonly credentials: TypeDescriptor;
    readonly data: TypeDescriptor;
    constructor(property: PropertyDeclaration);
    private extractDecoratorDescriptor;
    private getServiceName;
    private getStringLiteral;
    private getBooleanLiteral;
    private getStringArrayLiteral;
    private getCredentials;
    private getData;
    static isHub(property: PropertyDeclaration): Decorator;
}

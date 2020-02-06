import { MethodDeclaration, Decorator, ParameterDeclaration } from 'ts-morph';
import { IServiceName } from './commons';
import { TypeDescriptor } from './TypeDescriptor';
export interface IRestDecoratorDescriptor {
    tsDecorator: Decorator;
    service: string;
    isAuth: boolean;
    roles?: string[];
}
export interface IParamDescriptor {
    tsArgument: ParameterDeclaration;
    name: string;
    type: TypeDescriptor;
}
export interface IRestDescriptor {
    tsMethod: MethodDeclaration;
    decorator: IRestDecoratorDescriptor;
    service: IServiceName;
    method: string;
    params: IParamDescriptor[];
    strMethodParams: string;
    strRequestArgs: string;
    returnType: TypeDescriptor;
    credentialsType: TypeDescriptor | undefined;
}
export declare class RestDescriptor implements IRestDescriptor {
    readonly tsMethod: MethodDeclaration;
    readonly decorator: IRestDecoratorDescriptor;
    readonly service: IServiceName;
    readonly method: string;
    readonly params: IParamDescriptor[];
    readonly strMethodParams: string;
    readonly returnType: TypeDescriptor;
    readonly strRequestArgs: string;
    readonly credentialsType: TypeDescriptor | undefined;
    constructor(method: MethodDeclaration);
    private extractDecoratorDescriptor;
    private getServiceName;
    private extractCredentialsType;
    private getStringLiteral;
    private getBooleanLiteral;
    private getStringArrayLiteral;
    private getReturnType;
    private getParams;
    private hasDataParamDecorator;
    private getEmptyParamDecorator;
    private getDataParamDecoratorName;
    private paramsToStringArray;
    private paramsToMethodParams;
    private paramsToRequestArgs;
    static isRest(method: MethodDeclaration): Decorator;
}

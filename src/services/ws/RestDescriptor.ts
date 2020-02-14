import {
    MethodDeclaration,
    Decorator,
    ObjectLiteralExpression,
    ObjectLiteralElement,
    StringLiteral,
    BooleanLiteral,
    ArrayLiteralExpression,
    ParameterDeclaration,
    SignaturedDeclaration,
} from 'ts-morph';

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

export class RestDescriptor implements IRestDescriptor {

    //#region [ fields ]
    public readonly tsMethod: MethodDeclaration;
    public readonly decorator: IRestDecoratorDescriptor;
    public readonly service: IServiceName;
    public readonly method: string;
    public readonly params: IParamDescriptor[];
    public readonly strMethodParams: string;
    public readonly returnType: TypeDescriptor;
    public readonly strRequestArgs: string;
    public readonly credentialsType: TypeDescriptor | undefined;
    //#endregion

    //#region [ constructor ]
    constructor(method: MethodDeclaration) {
        this.tsMethod = method;
        this.decorator = this.extractDecoratorDescriptor(method);
        this.method = method.getName();
        this.service = this.getServiceName(this.decorator);
        this.params = this.getParams(method);
        this.returnType = this.getReturnType(method);
        this.credentialsType = this.extractCredentialsType(this.decorator);
        this.strMethodParams = this.paramsToMethodParams(this.params, this.credentialsType);
        this.strRequestArgs = this.paramsToRequestArgs(this.params);
    }
    //#endregion

    //#region [ private ]
    private extractServiceName(method: MethodDeclaration, options: ObjectLiteralExpression): string {
        const serviceProp = options.getProperty('service');
        return serviceProp
            ? this.getStringLiteral(serviceProp)
            : method.getParent().getProperty('service').getType().getText().replace(/^"(.*)"$/, '$1');
    }

    private extractDecoratorDescriptor(method: MethodDeclaration): IRestDecoratorDescriptor {
        const decorator = method.getDecorators().find(x => x.getName() == 'Rest');
        if (!decorator) {
            throw new Error('method is not decorated with Rest');
        }

        const options = decorator.getArguments()[0] as ObjectLiteralExpression;
        const service = this.extractServiceName(method, options);
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

    private getServiceName(decorator: IRestDecoratorDescriptor): IServiceName {
        return {
            name: decorator.service,
            upper: decorator.service.replace(/^\w/, c => c.toUpperCase()),
        };
    }
    private extractCredentialsType(decorator: IRestDecoratorDescriptor): TypeDescriptor | undefined {
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
    private getReturnType(method: MethodDeclaration) {
        const returnType = method.getReturnType();
        if (returnType.getText().startsWith('Promise')) {
            return new TypeDescriptor(returnType.getTypeArguments()[0]);
        } else {
            return new TypeDescriptor(returnType);
        }
    }
    private getParams(method: MethodDeclaration): IParamDescriptor[] {
        const result = new Array<IParamDescriptor>();
        const emptyDataParam = this.getEmptyParamDecorator(method);
        if (emptyDataParam) {
            result.push({
                tsArgument: emptyDataParam,
                name: emptyDataParam.getName(),
                type: new TypeDescriptor(emptyDataParam.getType()),
            });
        } else {
            method.getParameters().forEach(param => {
                if (this.hasDataParamDecorator(param)) {
                    const paramName = this.getDataParamDecoratorName(param);
                    result.push({
                        tsArgument: param,
                        name: paramName,
                        type: new TypeDescriptor(param.getType()),
                    });
                }
            });
        }
        return result;
    }
    private hasDataParamDecorator(param: ParameterDeclaration): boolean {
        return param.getDecorators().find(x => x.getName() == 'Data') ? true : false;
    }
    private getEmptyParamDecorator(method: MethodDeclaration): ParameterDeclaration {

        for (const param of method.getParameters()) {
            if (param) {
                if (this.hasDataParamDecorator(param)) {
                    if (!this.getDataParamDecoratorName(param)) {
                        return param;
                    }
                }
            }
        }
        return undefined;
    }
    private getDataParamDecoratorName(param: ParameterDeclaration) {
        const decorator = param.getDecorators().find(x => x.getName() == 'Data');
        const arg = decorator.getArguments()[0];
        if (arg) {
            const literal = arg as StringLiteral;
            return literal.getLiteralValue();
        } else {
            return undefined;
        }
    }
    private paramsToStringArray(params: IParamDescriptor[]): string[] {
        const result = new Array<string>();
        params.forEach(x => {
            result.push(`${x.name}: ${x.type.strType}`);
        });
        return result;
    }
    private paramsToMethodParams(params: IParamDescriptor[], credentials: TypeDescriptor): string {
        const allParams = params.concat();
        if (this.credentialsType) {
            allParams.push({
                name: 'credentials',
                tsArgument: null,
                type: this.credentialsType,
            });
        }
        return this.paramsToStringArray(allParams).join(', ');
    }
    private paramsToRequestArgs(param: IParamDescriptor[]): string {
        let result = ``;

        result += param.length > 0
            ? `{ ${this.params.map(x => x.name).join(', ')} }`
            : 'null';

        result += this.credentialsType
            ? ', credentials '
            : ', null ';

        return result;
    }
    //#endregion

    //#region [ static ]
    public static isRest(method: MethodDeclaration) {
        return method.getDecorators().find(x => x.getName() == 'Rest');
    }
    //#endregion
}

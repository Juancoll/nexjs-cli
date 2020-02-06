"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TypeDescriptor_1 = require("./TypeDescriptor");
class RestDescriptor {
    constructor(method) {
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
    extractDecoratorDescriptor(method) {
        const decorator = method.getDecorators().find(x => x.getName() == 'Rest');
        if (!decorator) {
            throw new Error('method is not decorated with Rest');
        }
        const value = decorator.getArguments()[0];
        const serviceProp = value.getProperty('service');
        const isAuthProp = value.getProperty('isAuth');
        const rolesProp = value.getProperty('roles');
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
    getServiceName(decorator) {
        return {
            name: decorator.service,
            upper: decorator.service.replace(/^\w/, c => c.toUpperCase()),
        };
    }
    extractCredentialsType(decorator) {
        const value = decorator.tsDecorator.getArguments()[0];
        const validation = value.getProperty('validation');
        if (!validation) {
            return undefined;
        }
        else {
            const functionType = validation.getChildren()[2].getType().getCallSignatures()[0].getDeclaration();
            const type = functionType.getParameters()[1].getType();
            return new TypeDescriptor_1.TypeDescriptor(type);
        }
    }
    getStringLiteral(literal) {
        return literal.getChildren()[2].getLiteralValue();
    }
    getBooleanLiteral(literal) {
        return literal.getChildren()[2].getLiteralValue();
    }
    getStringArrayLiteral(literal) {
        return eval(literal.getChildren()[2].getText());
    }
    getReturnType(method) {
        const returnType = method.getReturnType();
        if (returnType.getText().startsWith('Promise')) {
            return new TypeDescriptor_1.TypeDescriptor(returnType.getTypeArguments()[0]);
        }
        else {
            return new TypeDescriptor_1.TypeDescriptor(returnType);
        }
    }
    getParams(method) {
        const result = new Array();
        const emptyDataParam = this.getEmptyParamDecorator(method);
        if (emptyDataParam) {
            result.push({
                tsArgument: emptyDataParam,
                name: emptyDataParam.getName(),
                type: new TypeDescriptor_1.TypeDescriptor(emptyDataParam.getType()),
            });
        }
        else {
            method.getParameters().forEach(param => {
                if (this.hasDataParamDecorator(param)) {
                    const paramName = this.getDataParamDecoratorName(param);
                    result.push({
                        tsArgument: param,
                        name: paramName,
                        type: new TypeDescriptor_1.TypeDescriptor(param.getType()),
                    });
                }
            });
        }
        return result;
    }
    hasDataParamDecorator(param) {
        return param.getDecorators().find(x => x.getName() == 'Data') ? true : false;
    }
    getEmptyParamDecorator(method) {
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
    getDataParamDecoratorName(param) {
        const decorator = param.getDecorators().find(x => x.getName() == 'Data');
        const arg = decorator.getArguments()[0];
        if (arg) {
            const literal = arg;
            return literal.getLiteralValue();
        }
        else {
            return undefined;
        }
    }
    paramsToStringArray(params) {
        const result = new Array();
        params.forEach(x => {
            result.push(`${x.name}: ${x.type.strType}`);
        });
        return result;
    }
    paramsToMethodParams(params, credentials) {
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
    paramsToRequestArgs(param) {
        let result = `method: '${this.method}'`;
        if (param.length > 0) {
            result += `, data: { ${this.params.map(x => x.name).join(', ')} }`;
        }
        if (this.credentialsType) {
            result += `, credentials `;
        }
        return result;
    }
    static isRest(method) {
        return method.getDecorators().find(x => x.getName() == 'Rest');
    }
}
exports.RestDescriptor = RestDescriptor;
//# sourceMappingURL=RestDescriptor.js.map
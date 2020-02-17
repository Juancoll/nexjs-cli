import { IServiceName } from '../commons';
import { HubDescriptor } from '../HubDescriptor';
import { RestDescriptor, IParamDescriptor } from '../RestDescriptor';
import { TypesToImport } from '../TypesToImport';
import { IServiceDescriptor } from '../WSApiDescriptor';
import { ObjectLiteralElement, StringLiteral, ObjectLiteralExpression } from 'ts-morph';
import { TypeDescriptor } from '../TypeDescriptor';

interface CSHubEventDescriptor {
    event: string;
    data: string,
    credentials: string;
}

interface CSRestMethodDescriptor {
    method: string,
    returnType: string;
    methodParams: string;
    requestParams: string;
}

export class CSService {
    namespace: string;
    service: IServiceName;
    hub: CSHubEventDescriptor[];
    rest: CSRestMethodDescriptor[];

    constructor(namespace: string, descriptor: IServiceDescriptor) {
        this.namespace = namespace;
        this.service = descriptor.service;
        this.hub = descriptor.hub.map(x => ({
            event: x.event,
            data: this.getDataType(x),
            credentials: this.getCredentialType(x),
        }));
        this.rest = descriptor.rest.map(x => ({
            method: x.method,
            returnType: this.parseJsType(x.returnType.strType),
            methodParams: this.paramsToMethodParams(x.params, x.credentialsType),
            requestParams: this.paramsToRequestParams(x.params, x.credentialsType),
        }));
    }
    getCredentialType(desc: HubDescriptor): string {
        const decorator = desc.tsProperty.getDecorators().find(x => x.getName() == "CSHub");
        if (!decorator) {
            return desc.credentials.strType;
        } else {
            const options = decorator.getArguments()[0] as ObjectLiteralExpression;
            return options.getProperty('credentials')
                ? this.getStringLiteral(options.getProperty('credentials'))
                : this.parseJsType(desc.credentials.strType);
        }
    }
    getDataType(desc: HubDescriptor): string {
        const decorator = desc.tsProperty.getDecorators().find(x => x.getName() == "CSHub");
        if (!decorator) {
            return desc.credentials.strType;
        } else {
            const options = decorator.getArguments()[0] as ObjectLiteralExpression;
            return options.getProperty('data')
                ? this.getStringLiteral(options.getProperty('data'))
                : this.parseJsType(desc.credentials.strType);
        }
    }
    private getStringLiteral(literal: ObjectLiteralElement) {
        return (literal.getChildren()[2] as StringLiteral).getLiteralValue();
    }
    private parseJsType(value: string): string {
        let text = value;
        text = text.split('number').join('double');
        text = text.split('boolean').join('bool');
        return text;
    }
    private paramsToMethodParams(params: IParamDescriptor[], credentialsType: TypeDescriptor): string {
        const allParams = params.concat();
        if (credentialsType) {
            allParams.push({
                name: 'credentials',
                tsArgument: null,
                type: credentialsType,
            });
        }
        return this.paramsToStringArray(allParams).join(', ');
    }
    private paramsToStringArray(params: IParamDescriptor[]): string[] {
        const result = new Array<string>();
        params.forEach(x => {
            result.push(`${this.parseJsType(x.type.strType)} ${x.name}`);
        });
        return result;
    }
    private paramsToRequestParams(params: IParamDescriptor[], credentialsType: TypeDescriptor): string {
        let result = ``;

        result += params.length > 0
            ? `new { ${params.map(x => x.name).join(', ')} }`
            : 'null';

        result += credentialsType
            ? ', credentials '
            : ', null ';

        return result;
    }
}
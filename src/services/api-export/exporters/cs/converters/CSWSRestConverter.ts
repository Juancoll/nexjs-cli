import { ConverterBase } from '../../base/ConverterBase';
import { WSRestMethod } from 'src/services/api-export/models/ws/WSRestMethod';
import { CSConverter } from '../CSConverter';
import { RParam } from 'src/services/api-export/models/base/RParam';

export interface ICSRestMethodView {
    isAuth: boolean;
    name: string;
    methodParams: string;
    requestParams: string;
    returnType: string;
}

export class CSRestConverter extends ConverterBase<CSConverter, WSRestMethod, ICSRestMethodView>{

    //#region  [ implement ConverterBase ]
    convert(input: WSRestMethod): ICSRestMethodView {
        return {
            isAuth: input.options.isAuth,
            name: input.name,
            returnType: this.getRestReturnType(input),
            methodParams: this.getRestMethodParams(input),
            requestParams: this.getRestResquestParams(input)
        }
    }
    //#endregion

    //#region [ constructor ]
    constructor(parent: CSConverter) {
        super(parent);
    }
    //#endregion

    //#region  [ private ]
    private getRestCredentialType(rest: WSRestMethod): string {
        var decorator = rest.decorators.find(x => x.name == "CSRest");
        if (decorator && decorator.options) {
            var credentialType = decorator.options.credentials;
            if (credentialType) {
                return credentialType;
            }
        }

        return this.parent.getTypeInstanceName(rest.options.credentials)
    }
    private getRestReturnType(rest: WSRestMethod): string {
        if (!rest.returnType || rest.returnType.name == "void") {
            return undefined;
        } else {
            var decorator = rest.decorators.find(x => x.name == "CSRest");
            if (decorator && decorator.options) {
                var returnType = decorator.options.return;
                if (returnType) {
                    return `<${returnType}>`;
                }
            }
            return rest.returnType.name == 'Promise'
                ? rest.returnType.arguments[0].name == 'void'
                    ? undefined
                    : `<${this.parent.getTypeInstanceName(rest.returnType.arguments[0])}>`
                : `<${this.parent.getTypeInstanceName(rest.returnType)}>`;
        }
    }
    private getRestMethodParams(rest: WSRestMethod): string {
        const allParams = rest.params.concat();
        let result = allParams.map(x => `${this.getDataParamType(rest, x)} ${x.name}`).join(', ');
        if (rest.options.credentials) {
            result += `${allParams.length == 0 ? "" : ", "}${this.getRestCredentialType(rest)} credentials`;
        }
        return result;
    }
    private getRestResquestParams(hub: WSRestMethod): string {
        let result = ``;

        result += hub.params.length > 0
            ? this.isRootParam(hub.params[0])
                ? hub.params[0].name
                : `new { ${hub.params.map(x => x.name).join(', ')} }`
            : 'null';

        result += hub.options.credentials
            ? ', credentials '
            : ', null ';

        return result;
    }
    private getDataParamType(rest: WSRestMethod, param: RParam): string {
        var decorator = rest.decorators.find(x => x.name == "CSRest");
        if (decorator && decorator.options) {
            var data = decorator.options.data;
            if (data) {
                if (typeof data == "string" && this.isRootParam(param)) {
                    return data;
                }
                else if (data[param.name] && !this.isRootParam(param)) {
                    return data[param.name];
                }
            }
        }

        return this.parent.getTypeInstanceName(param.type)
    }

    private isRootParam(param: RParam): boolean {
        return param.decorators && param.decorators.length > 0 && !param.decorators[0].options;
    }
    //#endregion
}
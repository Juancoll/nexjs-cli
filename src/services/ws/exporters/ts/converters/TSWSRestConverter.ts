import { ConverterBase } from '../../base/ConverterBase';
import { WSRestMethod } from 'src/services/ws/models/ws/WSRestMethod';
import { TSConverter } from '../TSConverter';
import { RParam } from 'src/services/ws/models/base/RParam';

export interface ITSRestMethodView {
    isAuth: boolean;
    name: string;
    methodParams: string;
    requestParams: string;
    returnType: string;
    defaults: {
        credentials: string;
        data: string;
    }
}

export class TSRestConverter extends ConverterBase<TSConverter, WSRestMethod, ITSRestMethodView>{

    //#region  [ implement ConverterBase ]
    convert(input: WSRestMethod): ITSRestMethodView {
        try {
            return {
                isAuth: input.options.isAuth,
                name: input.name,
                returnType: this.getRestReturnType(input),
                methodParams: this.getRestMethodParams(input),
                requestParams: this.getRestResquestParams(input),
                defaults: {
                    credentials: this.parent.TypeDefaultValue.convert(input.options.credentials),
                    data: input.params.length == 0
                        ? '{}'
                        : `{ ${input.params.map(x => `${x.name}: ${this.parent.TypeDefaultValue.convert(x.type)}`).join(', ')} }`,
                }
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    //#endregion

    //#region [ constructor ]
    constructor(parent: TSConverter) {
        super(parent);
    }
    //#endregion

    //#region  [ private ]
    private getRestReturnType(rest: WSRestMethod): string {
        if (!rest.returnType || rest.returnType.name == "void") {
            return '<void>';
        } else {
            return rest.returnType.name == 'Promise'
                ? rest.returnType.arguments[0].name == 'void'
                    ? '<void>'
                    : `<${this.parent.getTypeInstanceName(rest.returnType.arguments[0])}>`
                : `<${this.parent.getTypeInstanceName(rest.returnType)}>`;
        }
    }
    private getRestMethodParams(rest: WSRestMethod): string {
        const allParams = rest.params.concat();
        let result = allParams.map(x => `${x.name}: ${this.parent.getTypeInstanceName(x.type)}`).join(', ');
        if (rest.options.credentials) {
            result += `${allParams.length == 0 ? "" : ", "}credentials: ${this.parent.getTypeInstanceName(rest.options.credentials)}`;
        }
        return result;
    }
    private getRestResquestParams(hub: WSRestMethod): string {
        let result = ``;

        result += hub.params.length > 0
            ? this.isRootParam(hub.params[0])
                ? hub.params[0].name
                : `{ ${hub.params.map(x => x.name).join(', ')} }`
            : 'null';

        result += hub.options.credentials
            ? ', credentials '
            : ', null ';

        return result;
    }

    private isRootParam(param: RParam): boolean {
        return param.decorators && param.decorators.length > 0 && !param.decorators[0].options;
    }
    //#endregion
}
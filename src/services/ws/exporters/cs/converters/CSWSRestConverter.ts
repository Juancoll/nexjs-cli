import { WSRestMethod } from '../../../models/ws/WSRestMethod'
import { RParam } from '../../../models/base/RParam'
import { ConverterBase } from '../../base/ConverterBase'
import { CSConverter } from '../CSConverter'

export interface ICSRestMethodView {
    isAuth: boolean;
    name: string;
    methodParams: string;
    requestParams: string;
    returnType: string;
    defaults: {
        data: string;
    };
}

export class CSRestConverter extends ConverterBase<CSConverter, WSRestMethod, ICSRestMethodView>{

    //#region  [ implement ConverterBase ]
    convert ( input: WSRestMethod ): ICSRestMethodView {
        return {
            isAuth: input.options.isAuth,
            name: input.name,
            returnType: this.getRestReturnType( input ),
            methodParams: this.getRestMethodParams( input ),
            requestParams: this.getRestResquestParams( input ),
            defaults: {
                data: input.params.length == 0
                    ? '{}'
                    : `{ ${input.params.map( x => `${x.name}: ${this.parent.TypeDefaultValue.convert( x.type )}` ).join( ', ' )} }`,
            },
        }
    }
    //#endregion

    //#region [ constructor ]
    constructor ( parent: CSConverter ) {
        super( parent )
    }
    //#endregion

    //#region  [ private ]
    private getRestReturnType ( rest: WSRestMethod ): string {
        if ( !rest.returnType || rest.returnType.name == 'void' ) {
            return undefined
        } else {
            const decorator = rest.decorators.find( x => x.name == 'CSRest' )
            if ( decorator && decorator.options ) {
                const returnType = decorator.options.return
                if ( returnType ) {
                    return `<${returnType}>`
                }
            }
            return rest.returnType.name == 'Promise'
                ? rest.returnType.arguments[0].name == 'void'
                    ? undefined
                    : `<${this.parent.getTypeInstanceName( rest.returnType.arguments[0] )}>`
                : `<${this.parent.getTypeInstanceName( rest.returnType )}>`
        }
    }
    private getRestMethodParams ( rest: WSRestMethod ): string {
        const allParams = rest.params.concat()
        const result = allParams.map( x => `${this.getDataParamType( rest, x )} ${x.name}` ).join( ', ' )
        return result
    }
    private getRestResquestParams ( hub: WSRestMethod ): string {
        let result = ''

        result += hub.params.length > 0
            ? this.isRootParam( hub.params[0] )
                ? hub.params[0].name
                : `new { ${hub.params.map( x => x.name ).join( ', ' )} }`
            : 'null'

        return result
    }
    private getDataParamType ( rest: WSRestMethod, param: RParam ): string {
        const decorator = rest.decorators.find( x => x.name == 'CSRest' )
        if ( decorator && decorator.options ) {
            const data = decorator.options.data
            if ( data ) {
                if ( typeof data == 'string' && this.isRootParam( param ) ) {
                    return data
                } else if ( data[param.name] && !this.isRootParam( param ) ) {
                    return data[param.name]
                }
            }
        }

        return this.parent.getTypeInstanceName( param.type )
    }

    private isRootParam ( param: RParam ): boolean {
        return param.decorators && param.decorators.length > 0 && !param.decorators[0].options
    }
    //#endregion
}
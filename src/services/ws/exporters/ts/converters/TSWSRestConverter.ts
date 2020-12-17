import { WSRestMethod } from '../../../models/ws/WSRestMethod'
import { RParam } from '../../../models/base/RParam'
import { ConverterBase } from '../../base/ConverterBase'
import { TSConverter } from '../TSConverter'

export interface ITSRestMethodView {
    isAuth: boolean;
    name: string;
    methodParams: string;
    requestParams: string;
    returnType: string;
    defaults: {
        data: string;
    };
}

export class TSRestConverter extends ConverterBase<TSConverter, WSRestMethod, ITSRestMethodView>{

    //#region  [ implement ConverterBase ]
    convert ( input: WSRestMethod ): ITSRestMethodView {
        try {
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
        } catch ( err ) {
            console.log( err )
        }
    }
    //#endregion

    //#region [ constructor ]
    constructor ( parent: TSConverter ) {
        super( parent )
    }
    //#endregion

    //#region  [ private ]
    private getRestReturnType ( rest: WSRestMethod ): string {
        if ( !rest.returnType || rest.returnType.name == 'void' ) {
            return '<void>'
        } else {
            return rest.returnType.name == 'Promise'
                ? rest.returnType.arguments[0].name == 'void'
                    ? '<void>'
                    : `<${this.parent.getTypeInstanceName( rest.returnType.arguments[0] )}>`
                : `<${this.parent.getTypeInstanceName( rest.returnType )}>`
        }
    }
    private getRestMethodParams ( rest: WSRestMethod ): string {
        const allParams = rest.params.concat()
        const result = allParams.map( x => `${x.name}: ${this.parent.getTypeInstanceName( x.type )}` ).join( ', ' )
        return result
    }
    private getRestResquestParams ( rest: WSRestMethod ): string {
        let result = ''

        result += rest.params.length > 0
            ? this.isRootParam( rest.params[0] )
                ? rest.params[0].name
                : `{ ${rest.params.map( x => x.name ).join( ', ' )} }`
            : 'null'

        return result
    }

    private isRootParam ( param: RParam ): boolean {
        return param.decorators && param.decorators.length > 0 && !param.decorators[0].options
    }
    //#endregion
}
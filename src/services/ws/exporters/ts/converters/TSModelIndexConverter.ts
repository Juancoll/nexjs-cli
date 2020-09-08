import { ConverterBase } from '../../base/ConverterBase'
import { RTypeDeclaration } from '../../../models/base/RTypeDeclaration'
import { TSConverter } from '../TSConverter'

export interface ITSImport {
    type: string;
    path: string;
}

export interface ITSModelIndexView {
    files: Array<{
        path: string;
    }>;
}

export class TSModelIndexConverter extends ConverterBase<TSConverter, RTypeDeclaration[], ITSModelIndexView>{

    //#region [ implement IConverter ]
    convert ( input: RTypeDeclaration[] ): ITSModelIndexView {
        return {
            files: input.map( x => ( { path: `./${x.name}` } ) ),
        }
    }
    //#endregion

    //#region [ constructor ]
    constructor ( parent: TSConverter ) {
        super( parent )
    }
    //#endregion
}
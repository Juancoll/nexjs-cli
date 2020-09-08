import { WSService } from '../../../models/ws/WSService'
import { ConverterBase } from '../../base/ConverterBase'
import { TSConverter } from '../TSConverter'
import { ITSWSServiceView } from './TSWSServiceConterter'

export interface ITSWSApiInput {
    packageName: string;
    packageVersion: string;
    services: WSService[];
}

export interface ITSWSApiView {
    name: string;
    version: string;
    services: ITSWSServiceView[];
}

export class TSWSApiConverter extends ConverterBase<TSConverter, ITSWSApiInput, ITSWSApiView>{

    //#region  [ implement ConverterBase ]
    convert ( input: ITSWSApiInput ): ITSWSApiView {
        return {
            name: input.packageName,
            version: input.packageVersion,
            services: input.services.map( x => this.parent.WSService.convert( x ) ),
        }
    }
    //#endregion

    //#region [ constructor ]
    constructor ( parent: TSConverter ) {
        super( parent )
    }
    //#endregion
}
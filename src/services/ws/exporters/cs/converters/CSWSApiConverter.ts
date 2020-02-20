import { ConverterBase } from '../../base/ConverterBase';
import { CSConverter } from '../CSConverter';
import { WSService } from 'src/services/ws/models/ws/WSService';
import { ICSWSServiceView } from './CSWSServiceConterter';

export interface ICSWSApiInput {
    namespace: string;
    version: string;
    services: WSService[];
}

export interface ICSWSApiView {
    namespace: string;
    version: string;
    services: ICSWSServiceView[];
}

export class CSWSApiConverter extends ConverterBase<CSConverter, ICSWSApiInput, ICSWSApiView>{

    //#region  [ implement ConverterBase ]
    convert(input: ICSWSApiInput): ICSWSApiView {
        return {
            namespace: input.namespace,
            version: input.version,
            services: input.services.map(x => this.parent.WSService.convert({
                namespace: input.namespace,
                wsservice: x,
            })),
        };
    }
    //#endregion

    //#region [ constructor ]
    constructor(parent: CSConverter) {
        super(parent);
    }
    //#endregion

}
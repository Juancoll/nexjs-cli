import { WSService } from '../../../models/ws/WSService';
import { ConverterBase } from '../../base/ConverterBase';
import { CSConverter } from '../CSConverter';
import { ICSWSServiceView } from './CSWSServiceConterter';

export interface ICSWSApiInput {
    name: string;
    version: string;
    services: WSService[];
}

export interface ICSWSApiView {
    name: string;
    version: string;
    services: ICSWSServiceView[];
}

export class CSWSApiConverter extends ConverterBase<CSConverter, ICSWSApiInput, ICSWSApiView>{

    //#region  [ implement ConverterBase ]
    convert(input: ICSWSApiInput): ICSWSApiView {
        return {
            name: input.name,
            version: input.version,
            services: input.services.map(x => this.parent.WSService.convert({
                namespace: input.name,
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
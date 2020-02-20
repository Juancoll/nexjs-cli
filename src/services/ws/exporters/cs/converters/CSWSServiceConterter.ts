import { ConverterBase } from '../../base/ConverterBase';
import { WSService } from '../../../models/ws/WSService';
import { CSConverter } from '../CSConverter';
import { ICSHubEventView } from './CSWSHubConverter';
import { ICSRestMethodView } from './CSWSRestConverter';


export interface ICSWSServiceInput {
    wsservice: WSService,
    namespace: string;
}

export interface ICSWSServiceView {
    namespace: string;

    serviceName: string;
    serviceUpperName: string;

    hubEvents: ICSHubEventView[];
    restMethods: ICSRestMethodView[];
}

export class CSWSServiceConterter extends ConverterBase<CSConverter, ICSWSServiceInput, ICSWSServiceView> {
    //#region  [ implement ConverterBase ]
    convert(input: ICSWSServiceInput): ICSWSServiceView {
        return {
            namespace: input.namespace,

            serviceName: input.wsservice.name,
            serviceUpperName: input.wsservice.name.replace(/^\w/, c => c.toUpperCase()),

            hubEvents: input.wsservice.hubEvents.map(x => this.parent.WSHub.convert(x)),
            restMethods: input.wsservice.restMethods.map(x => this.parent.WSRest.convert(x)),
        };
    }
    //#endregion

    //#region [ constructor ]
    constructor(parent: CSConverter) {
        super(parent);
    }
    //#endregion
}
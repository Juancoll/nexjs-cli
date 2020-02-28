import { ConverterBase } from '../../base/ConverterBase';
import { WSService } from '../../../models/ws/WSService';
import { TSConverter } from '../TSConverter';
import { ITSHubEventView } from './TSWSHubConverter';
import { ITSRestMethodView } from './TSWSRestConverter';
import { RTypeDeclaration } from 'src/services/ws/models/base/RTypeDeclaration';

export interface ITSImport {
    type: string;
    path: string;
}

export interface ITSWSServiceView {
    imports: ITSImport[];
    serviceName: string;
    serviceUpperName: string;

    hubEvents: ITSHubEventView[];
    restMethods: ITSRestMethodView[];
}

export class TSWSServiceConterter extends ConverterBase<TSConverter, WSService, ITSWSServiceView> {
    //#region  [ implement ConverterBase ]
    convert(input: WSService): ITSWSServiceView {
        return {
            imports: this.getImports(input),
            serviceName: input.name,
            serviceUpperName: input.name.replace(/^\w/, c => c.toUpperCase()),

            hubEvents: input.hubEvents.map(x => this.parent.WSHub.convert(x)),
            restMethods: input.restMethods.map(x => this.parent.WSRest.convert(x)),
        };
    }
    //#endregion

    //#region [ constructor ]
    constructor(parent: TSConverter) {
        super(parent);
    }
    //#endregion

    //#region [ private ]
    private getImports(s: WSService): ITSImport[] {
        const dependencies = s.getDependencies();
        return dependencies.map(x => ({
            type: x.name,
            path: `${x.name}`,
        }));
    }
    //#endregion
}
import { WSService } from '../../models/ws/WSService';
import { WSHubEvent } from '../../models/ws/WSHubEvent';
import { WSRestMethod } from '../../models/ws/WSRestMethod';
import { CodeConverterBase } from '../base/CodeConverterBase';
import { TSCode } from '../TSCode';

export class WSServicesConverter extends CodeConverterBase<undefined, WSService[]> {

    //#region [ implements CodeConverterBase ]
    public convert(): WSService[] {
        const output = new Array<WSService>();
        const hubs = this.extractHubs();
        const rests = this.extractRests();
        const hubServiceNames = hubs.map(x => x.options.service);
        const restServiceNames = rests.map(x => x.options.service);

        // remove duplicates 
        const uniqueNames = [...new Set(hubServiceNames.concat(restServiceNames))];
        uniqueNames.forEach(name => {
            const service = new WSService(name);
            service.addHub(hubs);
            service.addRest(rests);
            output.push(service);
        });
        return output;
    }
    //#endregion

    //#region [ constructor ]
    constructor(ts: TSCode) {
        super(ts);
    }
    //#endregion

    //#region [ private ]
    private extractHubs(): WSHubEvent[] {
        const result = new Array<WSHubEvent>();
        this.ts.contractFiles.forEach(file => {
            file.getClasses().forEach(classObj => {
                classObj.getProperties().forEach(property => {
                    if (this.ts.WSHubEvent.isHub(property)) {
                        const hub = this.ts.WSHubEvent.convert(property);
                        result.push(hub);
                    }
                });
            });
        });
        return result;
    }
    private extractRests(): WSRestMethod[] {
        const result = new Array<WSRestMethod>();
        this.ts.contractFiles.forEach(file => {
            file.getClasses().forEach(classObj => {
                classObj.getMethods().forEach(method => {
                    if (this.ts.WSRestMethod.isRest(method)) {
                        const rest = this.ts.WSRestMethod.convert(method);
                        result.push(rest);
                    }
                });
            });
        });
        return result;
    }
    //#endregion
}
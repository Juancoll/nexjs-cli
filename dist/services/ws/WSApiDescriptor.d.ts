import { HubDescriptor } from './HubDescriptor';
import { TypesToImport } from './TypesToImport';
import { RestDescriptor } from './RestDescriptor';
import { IServiceName } from './commons';
export interface IServiceDescriptor {
    service: IServiceName;
    hub: HubDescriptor[];
    rest: RestDescriptor[];
    typesToImport: TypesToImport;
}
export declare class WSApiDescriptor {
    private _sourceDir;
    private _targetDir;
    private _project;
    private _contractFiles;
    private _hubs;
    private _rests;
    constructor(sourceDir: string, targetDir: string, suffix: string);
    getServiceDescriptors(): IServiceDescriptor[];
    private extractHubs;
    private extractRests;
}

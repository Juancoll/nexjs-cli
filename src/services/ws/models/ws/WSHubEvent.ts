import { RType } from '../base/RType'
import { WSHubDecoratorOptions } from './decorators/WSHubDecoratorOptions'
import { RDecorator } from '../base/RDecorator'
import { RDependencies } from '../base/RDependencies'

export enum HubEventType {
    'HubEvent' = 'HubEvent',
    'HubEventData' = 'HubEventData',
    'HubEventSelection' = 'HubEventSelection',
    'HubEventSelectionData' = 'HubEventSelectionData',
    'HubEventValidation' = 'HubEventValidation',
    'HubEventValidationData' = 'HubEventValidationData',
    'HubEventValidationSelection' = 'HubEventValidationSelection',
    'HubEventValidationSelectionData' = 'HubEventValidationSelectionData',
}

export class WSHubEvent {

    //#region [ properties ]
    public eventType: HubEventType;
    public name: string;
    public dataType: RType;
    public valiationType: RType;
    public selectionType: RType;
    public options: WSHubDecoratorOptions;
    public decorators: RDecorator[];
    //#endregion

    constructor ( init?: Partial<WSHubEvent> ) { Object.assign( this, init ) }

    getDependencies (): RType[] {
        const dependencies = new RDependencies()

        dependencies.addType( this.valiationType )
        dependencies.addType( this.dataType )

        return dependencies.get()
    }
}
import { RType } from '../base/RType'
import { WSHubDecoratorOptions } from './decorators/WSHubDecoratorOptions'
import { RDecorator } from '../base/RDecorator'
import { RDependencies } from '../base/RDependencies'

export enum HubEventType {
    'HubEvent' = 'HubEvent',
    'HubEventCredentials' = 'HubEventCredentials',
    'HubEventCredentialsData' = 'HubEventCredentialsData',
    'HubEventData' = 'HubEventData'
}

export class WSHubEvent {

    //#region [ properties ]
    public eventType: HubEventType;
    public name: string;
    public data: RType;
    public credentials: RType;
    public options: WSHubDecoratorOptions;
    public decorators: RDecorator[];
    //#endregion

    constructor ( init?: Partial<WSHubEvent> ) { Object.assign( this, init ) }

    getDependencies (): RType[] {
        const dependencies = new RDependencies()

        dependencies.addType( this.options.credentials )
        dependencies.addType( this.data )

        return dependencies.get()
    }
}
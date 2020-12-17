import { ConverterBase } from '../../base/ConverterBase'
import { TSConverter } from '../TSConverter'
import { WSHubEvent, HubEventType } from '../../../models/ws/WSHubEvent'

export interface ITSHubEventView {
    isAuth: boolean;
    name: string;
    notification: string;
    arguments: string;
    defaults: {
        credentials: string;
    };
}

export class TSHubConverter extends ConverterBase<TSConverter, WSHubEvent, ITSHubEventView>{

    //#region  [ implement ConverterBase ]
    convert ( input: WSHubEvent ): ITSHubEventView {
        return {
            isAuth: input.options.isAuth,
            name: input.name,
            notification: this.getNotificationType( input ),
            arguments: this.getArguments( input ),
            defaults: { credentials: this.parent.TypeDefaultValue.convert( input.valiationType ) },
        }
    }
    //#endregion

    //#region [ constructor ]
    constructor ( parent: TSConverter ) {
        super( parent )
    }
    //#endregion

    //#region [ private ]
    private getNotificationType ( hub: WSHubEvent ): string {
        switch ( hub.eventType ) {
        case HubEventType.HubEvent: return 'lib.HubEvent'
        case HubEventType.HubEventData: return 'lib.HubEventData'
        case HubEventType.HubEventSelector: return 'lib.HubEventSelector'
        case HubEventType.HubEventSelectorData: return 'lib.HubEventSelectorData'
        }
    }

    private getArguments ( hub: WSHubEvent ): string {
        switch ( hub.eventType ) {
        case HubEventType.HubEvent: return ''
        case HubEventType.HubEventData: return `<${this.getDataType( hub )}>`
        case HubEventType.HubEventSelector: return `<${this.getValidationType( hub )}>`
        case HubEventType.HubEventSelectorData: return `<${this.getValidationType( hub )}, ${this.getDataType( hub )}>`
        }
    }
    private getValidationType ( hub: WSHubEvent ): string {
        return this.parent.getTypeInstanceName( hub.valiationType )
    }
    private getDataType ( hub: WSHubEvent ): string {
        return this.parent.getTypeInstanceName( hub.dataType )
    }
    //#endregion
}
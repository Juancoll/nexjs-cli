import { ConverterBase } from '../../base/ConverterBase'
import { CSConverter } from '../CSConverter'
import { WSHubEvent, HubEventType } from '../../../models/ws/WSHubEvent'

export interface ICSHubEventView {
    isAuth: boolean;
    name: string;
    notification: string;
    arguments: string;
    defaults: {
        credentials: string;
    };
}

export class CSHubConverter extends ConverterBase<CSConverter, WSHubEvent, ICSHubEventView>{

    //#region  [ implement ConverterBase ]
    convert ( input: WSHubEvent ): ICSHubEventView {
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
    constructor ( parent: CSConverter ) {
        super( parent )
    }
    //#endregion

    //#region [ private ]
    private getNotificationType ( hub: WSHubEvent ): string {
        switch ( hub.eventType ) {
        case HubEventType.HubEvent: return 'HubEvent'
        case HubEventType.HubEventData: return 'HubEventData'
        case HubEventType.HubEventSelector: return 'HubEventValidator'
        case HubEventType.HubEventSelectorData: return 'HubEventValidatorData'
        }
    }

    private getArguments ( hub: WSHubEvent ): string {
        switch ( hub.eventType ) {
        case HubEventType.HubEvent: return '<TUser, TToken>'
        case HubEventType.HubEventData: return `<TUser, TToken, ${this.getDataType( hub )}>`
        case HubEventType.HubEventSelector: return `<TUser, TToken, ${this.getValidationType( hub )}>`
        case HubEventType.HubEventSelectorData: return `<TUser, TToken, ${this.getValidationType( hub )}, ${this.getDataType( hub )}>`
        }
    }
    private getValidationType ( hub: WSHubEvent ): string {
        const decorator = hub.decorators.find( x => x.name == 'CSHub' )
        if ( decorator && decorator.options ) {
            const credentialType = decorator.options.credentials
            if ( credentialType ) {
                return credentialType
            }
        }

        return this.parent.getTypeInstanceName( hub.valiationType )
    }
    private getDataType ( hub: WSHubEvent ): string {
        const decorator = hub.decorators.find( x => x.name == 'CSHub' )
        if ( decorator && decorator.options ) {
            const dataType = decorator.options.data
            if ( dataType ) {
                return dataType
            }
        }

        return this.parent.getTypeInstanceName( hub.dataType )
    }
    //#endregion
}
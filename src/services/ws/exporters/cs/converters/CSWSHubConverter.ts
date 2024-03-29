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
        case HubEventType.HubEvent:
        case HubEventType.HubEventSelection: return 'HubEvent'

        case HubEventType.HubEventData:
        case HubEventType.HubEventSelectionData: return 'HubEventData'

        case HubEventType.HubEventValidation:
        case HubEventType.HubEventValidationSelection: return 'HubEventValidation'

        case HubEventType.HubEventValidationData:
        case HubEventType.HubEventValidationSelectionData: return 'HubEventValidationData'
        }
    }

    private getArguments ( hub: WSHubEvent ): string {
        switch ( hub.eventType ) {
        case HubEventType.HubEvent:
        case HubEventType.HubEventSelection: return '<TUser, TToken>'

        case HubEventType.HubEventData:
        case HubEventType.HubEventSelectionData: return `<TUser, TToken, ${this.getDataType( hub )}>`

        case HubEventType.HubEventValidation:
        case HubEventType.HubEventValidationSelection: return `<TUser, TToken, ${this.getValidationType( hub )}>`

        case HubEventType.HubEventValidationData:
        case HubEventType.HubEventValidationSelectionData: return `<TUser, TToken, ${this.getValidationType( hub )}, ${this.getDataType( hub )}>`
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
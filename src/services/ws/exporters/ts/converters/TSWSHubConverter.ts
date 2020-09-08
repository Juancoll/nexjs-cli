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
            defaults: { credentials: this.parent.TypeDefaultValue.convert( input.options.credentials ) },
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
        case HubEventType.HubEvent: return 'HubNotification'
        case HubEventType.HubEventData: return 'HubNotificationData'
        case HubEventType.HubEventCredentials: return 'HubNotificationCredentials'
        case HubEventType.HubEventCredentialsData: return 'HubNotificationCredentialsData'
        }
    }

    private getArguments ( hub: WSHubEvent ): string {
        // if (!hub.data) {
        //     if (!hub.options.credentials) {
        //         return '';
        //     } else {
        //         return `<${this.getCredentialType(hub)}>`
        //     }
        // } else {
        //     if (!hub.options.credentials) {
        //         return `<${this.getDataType(hub)}>`
        //     } else {
        //         return `<${this.getCredentialType(hub)}, ${this.getDataType(hub)}>`
        //     }
        // }
        switch ( hub.eventType ) {
        case HubEventType.HubEvent: return ''
        case HubEventType.HubEventData: return `<${this.getDataType( hub )}>`
        case HubEventType.HubEventCredentials: return `<${this.getCredentialType( hub )}>`
        case HubEventType.HubEventCredentialsData: return `<${this.getCredentialType( hub )}, ${this.getDataType( hub )}>`
        }
    }
    private getCredentialType ( hub: WSHubEvent ): string {
        return this.parent.getTypeInstanceName( hub.credentials )
    }
    private getDataType ( hub: WSHubEvent ): string {
        return this.parent.getTypeInstanceName( hub.data )
    }
    //#endregion
}
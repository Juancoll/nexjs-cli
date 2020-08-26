import { ConverterBase } from '../../base/ConverterBase';
import { CSConverter } from '../CSConverter';
import { WSHubEvent, HubEventType } from '../../../models/ws/WSHubEvent';

export interface ICSHubEventView {
    isAuth: boolean;
    name: string;
    notification: string;
    arguments: string;
    defaults: {
        credentials: string;
    }
}

export class CSHubConverter extends ConverterBase<CSConverter, WSHubEvent, ICSHubEventView>{

    //#region  [ implement ConverterBase ]
    convert(input: WSHubEvent): ICSHubEventView {
        if (input.options.service == "authContract") {
            console.log("inside");
        }
        try {
            return {
                isAuth: input.options.isAuth,
                name: input.name,
                notification: this.getNotificationType(input),
                arguments: this.getArguments(input),
                defaults: { credentials: this.parent.TypeDefaultValue.convert(input.options.credentials) },
            }
        }
        catch (err) {
            console.log("aaa");
        }
    }
    //#endregion

    //#region [ constructor ]
    constructor(parent: CSConverter) {
        super(parent);
    }
    //#endregion

    //#region [ private ]
    private getNotificationType(hub: WSHubEvent): string {
        switch (hub.eventType) {
            case HubEventType.HubEvent: return 'HubNotification';
            case HubEventType.HubEventData: return 'HubNotificationData';
            case HubEventType.HubEventCredentials: return 'HubNotificationCredentials';
            case HubEventType.HubEventCredentialsData: return 'HubNotificationCredentialsData';
        }
    }

    private getArguments(hub: WSHubEvent): string {
        // if (!hub.data) {
        //     if (!hub.options.credentials) {
        //         return '<TUser, TToken>';
        //     } else {
        //         return `<TUser, TToken, ${this.getCredentialType(hub)}>`
        //     }
        // } else {
        //     if (!hub.options.credentials) {
        //         return `<TUser, TToken, ${this.getDataType(hub)}>`
        //     } else {
        //         return `<TUser, TToken, ${this.getCredentialType(hub)}, ${this.getDataType(hub)}>`
        //     }
        // }
        switch (hub.eventType) {
            case HubEventType.HubEvent: return '<TUser, TToken>';
            case HubEventType.HubEventData: return `<TUser, TToken, ${this.getDataType(hub)}>`
            case HubEventType.HubEventCredentials: return `<TUser, TToken, ${this.getCredentialType(hub)}>`
            case HubEventType.HubEventCredentialsData: return `<TUser, TToken, ${this.getCredentialType(hub)}, ${this.getDataType(hub)}>`
        }
    }
    private getCredentialType(hub: WSHubEvent): string {
        var decorator = hub.decorators.find(x => x.name == "CSHub");
        if (decorator && decorator.options) {
            var credentialType = decorator.options.credentials;
            if (credentialType) {
                return credentialType;
            }
        }

        return this.parent.getTypeInstanceName(hub.credentials)
    }
    private getDataType(hub: WSHubEvent): string {
        var decorator = hub.decorators.find(x => x.name == "CSHub");
        if (decorator && decorator.options) {
            var dataType = decorator.options.data;
            if (dataType) {
                return dataType;
            }
        }

        return this.parent.getTypeInstanceName(hub.data)
    }
    //#endregion
}
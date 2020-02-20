import { ConverterBase } from '../../base/ConverterBase';
import { CSConverter } from '../CSConverter';
import { WSHubEvent } from '../../../models/ws/WSHubEvent';

export interface ICSHubEventView {
    isAuth: boolean;
    name: string;
    notification: string;
    arguments: string;
}

export class CSHubConverter extends ConverterBase<CSConverter, WSHubEvent, ICSHubEventView>{

    //#region  [ implement ConverterBase ]
    convert(input: WSHubEvent): ICSHubEventView {
        return {
            isAuth: input.options.isAuth,
            name: input.name,
            notification: this.getNotificationType(input),
            arguments: this.getArguments(input),
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
        if (!hub.data) {
            if (!hub.options.credentials) {
                return 'HubNotification';
            } else {
                return 'HubNotificationCredentials'
            }
        } else {
            if (!hub.options.credentials) {
                return 'HubNotificationData';
            } else {
                return 'HubNotificationCredentialsData'
            }
        }
    }

    private getArguments(hub: WSHubEvent): string {
        if (!hub.data) {
            if (!hub.options.credentials) {
                return '';
            } else {
                return `<${this.getCredentialType(hub)}>`
            }
        } else {
            if (!hub.options.credentials) {
                return `<${this.getDataType(hub)}>`
            } else {
                return `<${this.getCredentialType(hub)}, ${this.getDataType(hub)}>`
            }
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

        return this.parent.getTypeInstanceName(hub.options.credentials)
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
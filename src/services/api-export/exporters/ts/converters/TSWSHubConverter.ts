import { ConverterBase } from '../../base/ConverterBase';
import { TSConverter } from '../TSConverter';
import { WSHubEvent } from '../../../models/ws/WSHubEvent';

export interface ITSHubEventView {
    isAuth: boolean;
    name: string;
    notification: string;
    arguments: string;
}

export class TSHubConverter extends ConverterBase<TSConverter, WSHubEvent, ITSHubEventView>{

    //#region  [ implement ConverterBase ]
    convert(input: WSHubEvent): ITSHubEventView {
        return {
            isAuth: input.options.isAuth,
            name: input.name,
            notification: this.getNotificationType(input),
            arguments: this.getArguments(input),
        }
    }
    //#endregion

    //#region [ constructor ]
    constructor(parent: TSConverter) {
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
        return this.parent.getTypeInstanceName(hub.options.credentials)
    }
    private getDataType(hub: WSHubEvent): string {
        return this.parent.getTypeInstanceName(hub.data)
    }
    //#endregion
}
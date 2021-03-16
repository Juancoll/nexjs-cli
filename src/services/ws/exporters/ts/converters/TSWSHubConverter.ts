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
            notification: this.getHubEventType( input ),
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
    private getHubEventType ( hub: WSHubEvent ): string {
        switch ( hub.eventType ) {
        case HubEventType.HubEvent:
        case HubEventType.HubEventSelection: return 'lib.HubEvent'

        case HubEventType.HubEventData:
        case HubEventType.HubEventSelectionData: return 'lib.HubEventData'

        case HubEventType.HubEventValidation:
        case HubEventType.HubEventValidationSelection: return 'lib.HubEventValidation'

        case HubEventType.HubEventValidationData:
        case HubEventType.HubEventValidationSelectionData: return 'lib.HubEventValidationData'
        }
    }

    private getArguments ( hub: WSHubEvent ): string {
        switch ( hub.eventType ) {
        case HubEventType.HubEvent:
        case HubEventType.HubEventSelection: return ''

        case HubEventType.HubEventData:
        case HubEventType.HubEventSelectionData: return `<${this.getDataType( hub )}>`

        case HubEventType.HubEventValidation:
        case HubEventType.HubEventValidationSelection: return `<${this.getValidatorType( hub )}>`

        case HubEventType.HubEventValidationData:
        case HubEventType.HubEventValidationSelectionData: return `<${this.getValidatorType( hub )}, ${this.getDataType( hub )}>`
        }
    }
    private getValidatorType ( hub: WSHubEvent ): string {
        return this.parent.getTypeInstanceName( hub.valiationType )
    }
    private getDataType ( hub: WSHubEvent ): string {
        return this.parent.getTypeInstanceName( hub.dataType )
    }
    //#endregion
}
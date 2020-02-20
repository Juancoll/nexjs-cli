import { IHubMessage } from './IHubMessage';

export interface IHubRestMessage extends IHubMessage {
    method: string;
}

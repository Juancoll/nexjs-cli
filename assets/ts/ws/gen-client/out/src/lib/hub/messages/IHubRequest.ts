import { IHubRestMessage } from './IHubRestMessage';

export interface IHubRequest extends IHubRestMessage {
    credentials?: any;
}

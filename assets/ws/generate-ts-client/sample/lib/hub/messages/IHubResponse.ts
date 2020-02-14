import { IHubRestMessage } from './IHubRestMessage';
import { IWSError } from '../../base/IWSError';

export interface IHubResponse extends IHubRestMessage {
    isSuccess: boolean;
    error?: IWSError;
}

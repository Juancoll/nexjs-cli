
import { IMessage } from '../../../types/IMessage';

export interface IRestMessage extends IMessage {
    type: string;
    service: string;
    request: string;
    data: any;
}

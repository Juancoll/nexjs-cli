import { IMessage } from '../../../types/IMessage';

export interface IHubMessage extends IMessage {
    id: string;
    channel: string;
    type: string;
    data: any;
}

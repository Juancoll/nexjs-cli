import { IMessage } from '../../../types/IMessage';

export interface IConnectionMessage extends IMessage {
    command: string;
    protocol: string;
    data: any;
}

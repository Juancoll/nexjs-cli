import { IHubDecoratorOptions } from '../HubDecorator';
import { ISocketClient } from '@/lib/ws/base/sockets/ISocketClient';

export interface IHubEventDescriptor {
    service: string;
    event: string;
    instance: any;
    options: IHubDecoratorOptions;
    subscriptions: Array<{
        socket: ISocketClient;
        credentials: string;
    }>;
}

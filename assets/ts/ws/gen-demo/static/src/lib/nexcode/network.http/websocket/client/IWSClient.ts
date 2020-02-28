import { ExceptionEventArgs } from '@/lib/nexcode/types';
import { SimpleEventDispatcher } from 'strongly-typed-events';

import { IWSConnectionContext } from '../types/IWSConnectionContext';
import { WSConnectionCloseEventArgs } from '../types/WSConnectionCloseEventArgs';
import { ClientContractCollection } from '../contracts/base/ClientContractCollection';
import { ConnectionClientContractBase } from '../contracts/connection/base/ConnectionClientContractBase';
import { HubClientContract } from '../contracts/hub/HubClientContract';
import { RestClientContract } from '../contracts/rest/RestClientContract';

export interface IWSClient {

    autoReconnect: boolean;
    reconnectInterval: number;
    timeoutInterval: number;
    url: string | null;
    context: IWSConnectionContext | null;
    connectionContract: ConnectionClientContractBase | null;
    contracts: ClientContractCollection;
    isOpened: boolean;
    isConnecting: boolean;
    rest: RestClientContract;
    hub: HubClientContract;

    onIsOpenedChange: SimpleEventDispatcher<boolean>;
    onIsConnectingChange: SimpleEventDispatcher<boolean>;
    onUrlChange: SimpleEventDispatcher<string | null>;

    onConnecting: SimpleEventDispatcher<string | null>;
    onOpen: SimpleEventDispatcher<IWSConnectionContext | null>;
    onReceive: SimpleEventDispatcher<string>;
    onSend: SimpleEventDispatcher<string>;
    onClose: SimpleEventDispatcher<WSConnectionCloseEventArgs>;
    onError: SimpleEventDispatcher<ExceptionEventArgs>;

    connect(autoreconnect?: boolean): void;
    close(reason: string): void;
    send(msg: string): void;
}

import * as types from '@/lib/nexcode/types';
import * as http from '@/lib/nexcode/network.http';

export interface IWSClientSettings {
    server: IWSClientServerSettings;
    channels: IWSChannelsSettings;
    dependencies: types.IDic<IDependecySettings>;
}

export interface IDependecySettings {
    instanceName: string;
    contractUID: string;
    channels: IWSChannelsSettings;
}

export interface IWSChannelsSettings {
    hub: string;
    rest: string;
}

export interface IWSClientServerSettings {
    url: string;
    connectionData: http.websocket.IBasicClientData;
    channels: IWSChannelsSettings;
}

export interface IWSConnectionContext {
    id: string;
    ip: string;
    port: number;
    connectionProtocol: string;
    connectionData: any;
    isConnected: boolean;
}

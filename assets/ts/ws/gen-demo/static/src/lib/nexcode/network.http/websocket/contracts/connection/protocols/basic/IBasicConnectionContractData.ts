export interface IBasicConnectionContractData<TClientData, TServerData> {
    clientData: TClientData | null;
    serverData: TServerData | null;
}

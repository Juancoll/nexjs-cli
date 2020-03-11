export interface IAuthConnectionContractData<TClientData, TServerData, TVerificationData, TConfirmationData> {
    clientData: TClientData | null;
    serverData: TServerData | null;
    verificationData: TVerificationData | null;
    confirmationData: TConfirmationData | null;
}

import { IHubResponse } from '../messages/IHubResponse';

export interface IHubResponseError {
    response: IHubResponse;
    error: string;
}

import { IRestResponse } from '../messages/IRestResponse';

export interface IRestResponseError {
    response: IRestResponse;
    error: string;
}

import { IRestResponse } from '../interfaces/IRestResponse';

export class RestResponse {
    public static error(err: any) {
        return {
            isSuccess: false,
            error: err.message
                ? err.message
                : typeof err == 'string'
                    ? err
                    : JSON.stringify(err),
        } as IRestResponse;
    }
    public static success(data: any = null): IRestResponse {
        return {
            isSuccess: true,
            data,
        } as IRestResponse;
    }
}

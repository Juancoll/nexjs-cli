import { IRestRouteDescription } from '../../../../rest/interfaces/IRestRouteDescription';

export interface IRestContractDescription {
    name: string;
    description: string;
    requests: IRestRouteDescription[];
}

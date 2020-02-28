import { IGeoCoord } from './IGeoCoord';

export interface IGeoLocation {
    address: string;
    coord: IGeoCoord;
    more: any;
}

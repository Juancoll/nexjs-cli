import { IGeoLocation } from './IGeoLocation';
import { IDic } from './IDic';

export interface INodeSettings {
    uid: string;
    owner: string;
    ownerURL: string;
    product: string;
    displayName: string;
    group: string;
    computerName: string;
    location: IGeoLocation;
    www: INodeSettingsWWW;
    props: any;
}
export interface INodeSettingsWWW {
    apps: IDic<string>;
}
export interface INodeSettingsMobile {
    apps: string[];
}

import { INodeSettings } from '@/lib/nexcode/types';

export interface IAuthServerData {
    nodeSettings: INodeSettings;
    allowedApps: string;
}

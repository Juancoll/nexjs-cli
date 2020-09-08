import { RType } from '../../base/RType'

export class WSHubDecoratorOptions {
    service: string;
    isAuth: boolean;
    roles: string[] | undefined;
    credentials: RType;
}
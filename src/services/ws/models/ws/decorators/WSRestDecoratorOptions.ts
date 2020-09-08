import { RType } from '../../base/RType'

export class WSRestDecoratorOptions {
    service: string;
    isAuth: boolean;
    roles: string[] | undefined;
    credentials: RType;
}
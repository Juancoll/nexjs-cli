import { RType } from '../../reflection/RType';

export class WSHubDecoratorOptions {
    service: string;
    isAuth: boolean;
    roles: string[] | undefined;
    validation: {
        user: RType,
        credentials: RType
    }
}
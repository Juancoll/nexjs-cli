import { RType } from '../reflection/RType';

export class WSRestDecoratorOptions {
    service: string;
    isAuth: boolean;
    roles: string[] | undefined;
    validation: {
        user: RType,
        credentials: RType,
    };
    selection: {
        user: RType,
        userCredentials: RType,
    }
}
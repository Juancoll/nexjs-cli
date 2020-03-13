import { SimpleEventDispatcher } from 'strongly-typed-events';
import { IAuthApp } from '@/lib/auth/IAuthApp';
import { IAuthUser } from '@/lib/auth/IAuthUser';

export class NoAuthApp implements IAuthApp {

    public get isAuth(): boolean { return false; }
    public get user(): IAuthUser | undefined | null { return undefined; }
    public readonly onAuthenticate = new SimpleEventDispatcher<IAuthUser | null>();

    public async register(data: any): Promise<IAuthUser> {
        throw new Error('No implemented method');
    }
    public async login(data: any): Promise<IAuthUser> {
        throw new Error('No implemented method');
    }
    public async logout(): Promise<void> {
        throw new Error('No implemented method');
    }
}

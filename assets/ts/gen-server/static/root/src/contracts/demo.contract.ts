import { Injectable } from '@nestjs/common';
import {
    Context,
    Data,
    Hub, Rest,
    IName,
    CSRest,
    CSHub,
    HubEvent,
    HubEventCredentials,
    HubEventCredentialsData,
    HubEventData,
} from '@/lib/ws';

import { db } from '@/services/db';

import { User, Player, Org } from '@/models/main';
import { MyDTO } from './types/MyDto';
import { ContractBase } from './base/ContractBase';

@Injectable()
export class DemoContract extends ContractBase {
    //#region [ contractBase ]
    public readonly name = 'demo';
    //#endregion

    //#region  [ constructor ]
    constructor() { super(); }
    //#endregion

    //#region  [ logic ]
    eventValidation(user: User, credentials: any): boolean {
        this.logger.log('DemoContract.eventValidation');
        console.log({ user, credentials });
        return true;
    }
    eventSelection(user: User, userCredentials: any, serverCredentials: any): boolean {
        this.logger.log('DemoContract.eventSelection');
        console.log({ user, userCredentials, serverCredentials });
        return true;
    }
    //#endregion

    //#region  [ events ]
    @Hub()
    onUpdate = new HubEvent({ id: 'onUpdate', debug: false });

    @CSHub({ credentials: 'int' })
    @Hub<DemoContract>({
        isAuth: true,
        roles: ['admin'],
        validation: async (instance, user, credentials: MyDTO) => instance.eventValidation(user, credentials),
        selection: async (instance, user, userCredentials, serverCredentials) => instance.eventSelection(user, userCredentials, serverCredentials),
    })
    onUpdateCredentials = new HubEventCredentials<number>({ id: 'onUpdateCredentials', debug: false });

    @Hub<DemoContract>({
        isAuth: true,
        roles: ['admin'],
        validation: async (instance, user, credentials: MyDTO[]) => instance.eventValidation(user, credentials),
        selection: async (instance, user, userCredentials, serverCredentials) => instance.eventSelection(user, userCredentials, serverCredentials),
    })
    onUpdateCredentialsData = new HubEventCredentialsData<number, MyDTO>({ id: 'onUpdateCredentialsData', debug: false });

    @Hub<DemoContract>({
        isAuth: true,
        roles: ['admin'],
        selection: async (instance, user, userCredentials, serverCredentials) => instance.eventSelection(user, userCredentials, serverCredentials),
    })
    onUpdateData = new HubEventData<User>({ id: 'onUpdateData', debug: false });

    //#region [ methods ]
    @Rest()
    emitEvents() {
        console.log('executeEvents()');
        this.onUpdateCredentials.emit(0);
        this.onUpdateCredentialsData.emit(0, { a: 'AAAA', b: false });
        this.onUpdateData.emit(new User());
        this.onUpdate.emit();

        return new MyDTO({
            a: 'executeEvents Response',
            b: true,
        });
    }

    @CSRest({ return: 'int', data: { age: 'uint' } })
    @Rest<DemoContract>({
        isAuth: true,
        roles: ['admin'],
    })
    funcA(
        @Context('user') user: User,
        @Context('token') token: string,
        @Data('name') name: string,
        @Data('surname') surname: string,
        @Data('age') age: number,
    ) {
        console.log('funcA');
        console.log({ user, token, name, surname, age });
        return -1;
    }

    @Rest<DemoContract>({
        isAuth: true,
        roles: ['admin'],
        validation: async (instance, user, credentials: string) => true,
    })
    funcB(
        @Context('user') user: User,
        @Context('token') token: string,
        @Data() data: MyDTO,
    ): string {
        console.log('funcA');
        console.log({ user, token, data });
        return 'aaa';
    }

    @CSRest({ credentials: 'uint', return: 'int' })
    @Rest<DemoContract>({
        isAuth: true,
        roles: ['admin'],
        validation: async (instance, user, credentials: number) => true,
    })
    async funcC(): Promise<number> {
        console.log('funcC');
        return -1;
    }
    @Rest()
    funcD(@Data() data: string): void {
        console.log('funcD');
        console.log(data);
    }

    @Rest()
    async funcE(@Data() data: string): Promise<void> {
        console.log('funcE');
    }

    @Rest({ isAuth: true })
    async changeUser(
        @Context('user') authUser: User,
        @Data('name') name: string,
        @Data('surname') surname: string,
        @Data('player') player: Player,
        @Data('org') org: Org,
    ): Promise<User> {
        const user = await db.main.users.findById(authUser._id);
        user.name = name;
        user.surname = surname;
        await db.main.users.updateModel(user);
        setTimeout(() => this.onUpdateData.emit(user), 2000);
        return user;
    }
    //#endregion
}

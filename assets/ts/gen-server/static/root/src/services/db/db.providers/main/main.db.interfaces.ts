import { User, Player } from '@/models/main';
import { IDBProvider, IModelProvider } from '@/lib/db';
import { IAuthRepository } from '@/lib/db/IAuthRepository';

export interface IMainDBProvider extends IDBProvider, IAuthRepository {
    users: IUserMainDBProvider;
    players: IPlayerMainDBProvider;
}

// Users Collection
export interface IUserMainDBProvider extends IAuthRepository, IModelProvider<User> {
    createMany(count: number, createAdmin: boolean): Promise<User[]>;
}

export interface IPlayerMainDBProvider extends IModelProvider<Player> {
    // - nothing
}

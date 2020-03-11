import { SimpleEventDispatcher } from 'strongly-typed-events';

import { IAuthStrategy, IAuthInfo, ISocketClient } from '@/lib/ws';
import { crypt } from '@/services/crypt';
import { db } from '@/services/db';
import { jwt } from '@/services/jwt';
import { User } from '@/models/main';

interface IUserClients {
    user: User;
    clients: ISocketClient[];
}
interface IConnection {
    user: User;
    client: ISocketClient;
}

interface IConnectionEventArgs {
    conn: IConnection;
    sender: UserAuthProvider;
}

export class UserAuthProvider implements IAuthStrategy<User, string> {

    //#region  [ field ]
    public users: IUserClients[] = [];
    public connections: IConnection[] = [];
    //#endregion

    //#region [ events ]
    public readonly onAdd = new SimpleEventDispatcher<IConnectionEventArgs>();
    public readonly onRemove = new SimpleEventDispatcher<IConnectionEventArgs>();
    //#endregion

    //#region [ IAuthStrategy ]
    async register(client: ISocketClient, data: any): Promise<IAuthInfo<User, string>> {
        const email = data.email;
        const pass = data.password;

        if (!email) { throw new Error(`email required`); }
        if (!pass) { throw new Error(`password required`); }

        const encryptedPassword = crypt.encode(pass);
        const user = await db.createUser(email, encryptedPassword) as User;
        const { password, ...userWithoutPassword } = user; // remove password property (now we use an interceptor)

        const token = jwt.sign({ _id: user._id, email: user.email, roles: user.roles });

        return this.add(client, userWithoutPassword as User, token);
    }
    async login(client: ISocketClient, data: any): Promise<IAuthInfo<User, string>> {
        const email = data.email;
        const pass = data.password;

        const user = await db.getUserByEmail(email);
        if (user && crypt.compare(pass, user.password)) {
            const { password, ...userWithoutPassword } = user; // remove password property (now we use an interceptor)
            const token = jwt.sign({ _id: user._id, email: user.email, roles: user.roles });

            return this.add(client, userWithoutPassword as User, token);
        }
        throw new Error('unauthorized');
    }
    async logout(client: ISocketClient): Promise<void> {
        this.remove(client);
        return;
    }
    async authenticate(client: ISocketClient, token: string): Promise<User> {
        const payload = jwt.verify<User>(token);
        if (!payload.email || !payload.roles) {
            throw new Error('invalid token');
        }
        const user = {
            _id: payload._id,
            email: payload.email,
            roles: payload.roles,
        } as User;
        this.add(client, user, token);
        return user;
    }
    //#endregion

    //#region [ private ]
    private add(client: ISocketClient, user: User, token: string): IAuthInfo<User, string> {

        this.connections.push({ user, client });
        let found = this.users.find(x => x.user.email == user.email);
        if (!found) {
            found = { user, clients: [] };
            this.users.push(found);
        }
        found.clients.push(client);

        client.onDisconnect(() => {
            this.remove(client);
        });
        this.onAdd.dispatch({ conn: { user, client }, sender: this });
        return { user, token };
    }
    private remove(client: ISocketClient): void {
        const conn = this.connections.find(x => x.client.id == client.id);
        if (conn) {
            const item = this.users.find(x => x.user.email == conn.user.email);
            if (item) {
                item.clients = item.clients.filter(x => x.id != client.id);
                if (item.clients.length == 0) {
                    this.users = this.users.filter(x => x.user.email != item.user.email);
                }
            }

            this.connections = this.connections.filter(x => x.client.id != client.id);
            this.onRemove.dispatch({ conn, sender: this });
        }
    }
    //#endregion
}

import { Player } from '@/models/main';
import { IAuthStrategy, IAuthInfo, ISocketClient } from '@nexjs/wsserver';
import { db } from '@/services/db';
import { SimpleEventDispatcher } from 'strongly-typed-events';
import { jwt } from '@/services/jwt';

interface IPlayerClients {
    player: Player;
    clients: ISocketClient[];
}
interface IConnection {
    player: Player;
    client: ISocketClient;
}

interface IConnectionEventArgs {
    conn: IConnection;
    sender: PlayerAuthProvider;
}

export class PlayerAuthProvider implements IAuthStrategy<Player, string> {

    //#region  [ field ]
    public players: IPlayerClients[] = [];
    public connections: IConnection[] = [];
    //#endregion

    //#region [ events ]
    public readonly onAdd = new SimpleEventDispatcher<IConnectionEventArgs>();
    public readonly onRemove = new SimpleEventDispatcher<IConnectionEventArgs>();
    //#endregion

    //#region [ IAuthStrategy ]
    async register(client: ISocketClient, data: any): Promise<IAuthInfo<Player, string>> {
        throw new Error('forbidden action');
    }
    async login(client: ISocketClient, data: any): Promise<IAuthInfo<Player, string>> {
        const name = data.name;
        const serial = data.serial;

        if (!name) { throw new Error(`id required`); }
        if (!serial) { throw new Error(`serial required`); }

        const player = await db.main.players.findOne({ name });
        if (player && serial == player.serial) {
            const token = jwt.sign({ _id: player._id, name: player.name, serial: player.serial, label: player.serial });
            return this.add(client, player, token);
        }
        throw new Error('unauthorized');
    }
    async logout(client: ISocketClient): Promise<void> {
        this.remove(client);
        return;
    }
    async authenticate(client: ISocketClient, token: string): Promise<Player> {
        const payload = jwt.verify<Player>(token);
        if (!payload.name || !payload.serial) {
            throw new Error('invalid token');
        }
        const player = {
            _id: payload._id,
            name: payload.name,
            serial: payload.serial,
            label: payload.label,
        } as Player;
        this.add(client, player, token);
        return player;
    }
    //#endregion

    //#region [ private ]
    private add(client: ISocketClient, player: Player, token: string): IAuthInfo<Player, string> {

        this.connections.push({ player, client });
        let found = this.players.find(x => x.player.name == player.name);
        if (!found) {
            found = { player, clients: [] };
            this.players.push(found);
        }
        found.clients.push(client);

        client.onDisconnect(() => {
            this.remove(client);
        });
        this.onAdd.dispatch({ conn: { player, client }, sender: this });
        return { user: player, token };
    }
    private remove(client: ISocketClient): void {
        const conn = this.connections.find(x => x.client.id == client.id);
        if (conn) {
            const item = this.players.find(x => x.player.name == conn.player.name);
            if (item) {
                item.clients = item.clients.filter(x => x.id != client.id);
                if (item.clients.length == 0) {
                    this.players = this.players.filter(x => x.player.name != item.player.name);
                }
            }

            this.connections = this.connections.filter(x => x.client.id != client.id);
            this.onRemove.dispatch({ conn, sender: this });
        }
    }
    //#endregion
}

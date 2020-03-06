import { Injectable, Logger } from '@nestjs/common';
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

import { WSServer, SocketIOServer, IAuthInfo } from '@/lib/ws';
import { User, Player } from '@/models/main';

import { AuthStrategy, IToken, IUser } from './contracts/auth/AuthStrategy';
import { DemoContract } from './contracts/demo.contract';
import { DBContract } from './contracts/db.contract';
import { JobsContract } from './contracts/jobs.contract';
import { OrgsContract } from './contracts/orgs.contract';
import { UsersContract } from './contracts/users.contract';

@WebSocketGateway({
    path: '/wsapi',
    namespace: '/',
})
@Injectable()
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
    //#region [ properties ]
    @WebSocketServer() public server: Server;
    public logger = new Logger('AppGateway');
    public wss: WSServer<IUser, IToken>;
    //#endregion

    constructor(
        private readonly dbContract: DBContract,
        private readonly demoContract: DemoContract,
        private readonly jobsContract: JobsContract,
        private readonly orgsContract: OrgsContract,
        private readonly usersContract: UsersContract,
    ) {
        this.wss = new WSServer<IUser, IToken>(new AuthStrategy());
        this.wss.auth.isLoginRequired = true;
        this.wss.auth.loginRequiredTimeout = 5000;
        this.registerDebugEvents();
        this.wss.register(this.dbContract);
        this.wss.register(this.demoContract);
        this.wss.register(this.jobsContract);
        this.wss.register(this.orgsContract);
        this.wss.register(this.usersContract);
    }

    //#region  [ gateway interfaces ]
    afterInit(server: Server) {
        this.logger.log('initialized');
        this.wss.init(new SocketIOServer(server));
    }
    handleConnection(client: SocketIO.Socket) {
        this.logger.log(`[server] connected id:    ${client.id}, #clients: ${Object.keys(this.server.sockets).length}`);
    }
    handleDisconnect(client: SocketIO.Socket) {
        this.logger.log(`[server] disconnected id: ${client.id}, #clients: ${Object.keys(this.server.sockets).length}`);
    }
    //#endregion

    //#region [ private ]
    registerDebugEvents() {

        //#region [ auth strategy events]
        const strategy = this.wss.auth.strategy as AuthStrategy;
        strategy.providers.user.onAdd.sub(e => this.logger.log(`[wss][auth][provider:'user'] add(${e.conn.user.email}), #conn: ${e.sender.connections.length}, #users: ${e.sender.users.length}`));
        strategy.providers.user.onRemove.sub(e => this.logger.log(`[wss][auth][provider:'user'] remove(${e.conn.user.email}), #conn: ${e.sender.connections.length}, #users: ${e.sender.users.length}`));

        strategy.providers.player.onAdd.sub(e => this.logger.log(`[wss][auth][provider:'player'] add(${e.conn.player.name}), #conn: ${e.sender.connections.length}, #player: ${e.sender.players.length}`));
        strategy.providers.player.onRemove.sub(e => this.logger.log(`[wss][auth][provider:'player'] remove(${e.conn.player.name}), #conn: ${e.sender.connections.length}, #player: ${e.sender.players.length}`));
        //#endregion

        //#region [ auth event ]
        this.wss.auth.onTimeout.sub(e => this.logger.log(`[wss][auth] onTimeout client.id: ${e.id}: login or authenticate required in ${this.wss.auth.loginRequiredTimeout} millis.`));
        this.wss.auth.onAuthenticate.sub(e => this.logger.log(`[wss][auth] onAuthenticate client.id: ${e.client.id}, authInfo:{  user: ${this.extractAuthId(e.authInfo)}, token:..., }`));
        this.wss.auth.onLogin.sub(e => this.logger.log(`[wss][auth] onLogin client.id: ${e.client.id}, authInfo:{  user: ${this.extractAuthId(e.authInfo)}, token:..., }`));
        this.wss.auth.onLogout.sub(e => this.logger.log(`[wss][auth] onLogout client.id: ${e.client.id},authInfo:{  user: ${this.extractAuthId(e.authInfo)}, token:..., }`));
        this.wss.auth.onRegister.sub(e => this.logger.log(`[wss][auth] onRegister client.id: ${e.client.id}, authInfo:{  user: ${this.extractAuthId(e.authInfo)}, token:..., }`));
        //#endregion

        //#region [ hub events]
        this.wss.hub.onRegister.sub(e => this.logger.log(`[wss][hub] onRegister service: ${e.service}, event: ${e.event}, isAuth: ${e.options.isAuth}, roles: ${e.options.roles}`));
        this.wss.hub.onPublish.sub(e => this.logger.log(`[wss][hub] onPublish  service: ${e.descriptor.service}, event: ${e.descriptor.event}, clients: ${e.clients.map(x => x.id).join(',')}`));
        this.wss.hub.onSuscribed.sub(e => this.logger.log(`[wss][hub]${e.error ? '[error]' : ''} onSuscribed service: ${e.service}, event: ${e.event}, client: ${e.client.id}`));
        this.wss.hub.onUnsuscribed.sub(e => this.logger.log(`[wss][hub]${e.error ? '[error]' : ''} onUnsuscribed service: ${e.service}, event: ${e.event}, client: ${e.client.id}`));
        //#endregion

        //#region  [ rest events ]
        this.wss.rest.onRegister.sub(e => this.logger.log(`[wss][rest] onRegister service: ${e.service}, method: ${e.method}, isAuth: ${e.options.isAuth}, roles: ${e.options.roles}`));
        this.wss.rest.onRequest.sub(e => this.logger.log(`[wss][rest]${e.error ? '[error]' : ''} onRequest service: ${e.service}, method: ${e.method}, client: ${e.client.id}${e.error ? ', error: ' + e.error.message : ''}`));
        //#endregion
    }
    //#endregion

    //#region [ private ]
    extractAuthId(auth: IAuthInfo<IUser, IToken>) {
        if (!auth || !auth.user) {
            return 'undefined';
        }
        if ((auth.user as User).email) {
            return (auth.user as User).email;
        }
        if ((auth.user as Player).name) {
            return (auth.user as Player).name;
        }
    }
    //#endregion
}

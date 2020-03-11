import './style.scss';
import { Component, Vue } from 'vue-property-decorator';
import { wsapi } from '@/services/wsapi';
import { env } from '@/services/env';

// tslint:disable-next-line: interface-over-type-literal
type ILoginData = { [key: string]: string };

@Component({
    template: require('./template.pug'),
})
export default class UserWSServiceView extends Vue {

    //#region [ properties ]
    public url: string = 'http://localhost:3000';
    public path: string = '/wsapi';
    public nsp: string = '/';

    public isConnected: boolean = wsapi.ws.isConnected;
    public isAuthenticate: boolean = wsapi.auth.authInfo ? true : false;

    public loginData = {
        user: {
            provider: 'user',
            email: env.vars.defaults.login.user.email || '',
            password: env.vars.defaults.login.user.password || '',
        } as ILoginData,
        player: {
            provider: 'player',
            name: env.vars.defaults.login.player.name || '',
            serial: env.vars.defaults.login.player.serial || '',
        } as ILoginData,
    };
    //#endregion

    //#region [ constructor ]
    constructor() {
        super();
        this.authenticateChangeHandle = this.authenticateChangeHandle.bind(this);
        this.connectionChangeHandle = this.connectionChangeHandle.bind(this);
    }
    //#endregion

    //#region [ handles ]
    authenticateChangeHandle(value: boolean) {
        this.isAuthenticate = value;
    }
    connectionChangeHandle(value: boolean) {
        this.isConnected = value;
    }
    //#endregion

    //#region [ ws ]
    connect() {
        console.log(`[ui][wsapi.ws] connect to url: ${this.url}, path: ${this.path}, namespace: ${this.nsp}`);
        wsapi.ws.connect(this.url, this.path, this.nsp);
    }
    disconnect() {
        console.log(`[ui][wsapi.ws] disconnect`);
        wsapi.ws.disconnect();
    }
    //#endregion

    //#region [ http api ]
    async register(data: any) {
        try {
            console.log(`[ui][wsapi.auth] register`);

            const t1 = new Date().getTime();
            const response = await wsapi.auth.register(data);
            const t2 = new Date().getTime();

            console.log(`[response] in ${t2 - t1} ms`, response);
        } catch (err) {
            console.error('[response][error]', err);
        }
    }
    async login(data: any) {
        try {
            console.log(`[ui][wsapi.auth] login`);

            const t1 = new Date().getTime();
            const response = await wsapi.auth.login(data);
            const t2 = new Date().getTime();

            console.log(`[response] in ${t2 - t1} ms`, response);
        } catch (err) {
            console.error('[response][error]', err);
        }
    }
    async logout() {
        try {
            console.log(`[ui][wsapi.auth] logout`);

            const t1 = new Date().getTime();
            const response = await wsapi.auth.logout();
            const t2 = new Date().getTime();

            console.log(`[response] in ${t2 - t1} ms`, response);
        } catch (err) {
            console.error('[response][error]', err);
        }
    }
    async authenticate() {
        try {
            console.log(`[ui][wsapi.auth] authenticate`);
            if (!wsapi.auth.authInfo) {
                throw new Error('login or register required');
            }
            const t1 = new Date().getTime();
            const response = await wsapi.auth.authenticate(wsapi.auth.authInfo.token);
            const t2 = new Date().getTime();

            console.log(`[response] in ${t2 - t1} ms`, response);
        } catch (err) {
            console.error('[response][error]', err);
        }
    }
    //#endregion

    //#region [ vue ]
    mounted() {
        wsapi.auth.onAuthenticateChange.sub(this.authenticateChangeHandle);
        wsapi.ws.onConnectionChange.sub(this.connectionChangeHandle);
    }
    destroyed() {
        wsapi.auth.onAuthenticateChange.unsub(this.authenticateChangeHandle);
        wsapi.ws.onConnectionChange.unsub(this.connectionChangeHandle);
    }
    //#endregion
}

import './style.scss';
import { Component, Vue } from 'vue-property-decorator';
import { INotification } from '@/lib/vue/vue-notification/types/INotification';

import { wsapi } from '@/services/wsapi';

import { MyDTO } from '@/lib/ws/models/MyDTO';
import { User } from '@/lib/ws/models/User';
import { Model } from '@/lib/ws/models/Model';
import { ModelComponent } from '@/lib/ws/models/ModelComponent';
import { Player } from '@/lib/ws/models/Player';
import { ModelRef } from '@/lib/ws/models/ModelRef';
import { Org } from '@/lib/ws/models/Org';
import { DataModelRef } from '@/lib/ws/models/DataModelRef';
import { Permissions } from '@/lib/ws/models/Permissions';
interface IHubEvent { isAuth: boolean; name: string; credentials: string; }
interface IRestMethod { isAuth: boolean; name: string; data: string; credentials: string; }

@Component({
    template: require('./template.pug'),
})
export default class DemoWSServiceView extends Vue {

    //#region [ properties ]
    public service: string = 'demo';
    public hubEvents: IHubEvent[] = [
        {
            isAuth: false,
            name: 'onUpdate',
            credentials: `undefined`,
        },
        {
            isAuth: true,
            name: 'onUpdateCredentials',
            credentials: `new MyDTO()`,
        },
        {
            isAuth: true,
            name: 'onUpdateCredentialsData',
            credentials: `[new MyDTO()]`,
        },
        {
            isAuth: true,
            name: 'onUpdateData',
            credentials: `undefined`,
        },
    ];
    public restMethods: IRestMethod[] = [
        {
            isAuth: false,
            name: 'emitEvents',
            data: `{}`,
            credentials: `undefined`,
        },
        {
            isAuth: true,
            name: 'funcA',
            data: `{ name: "My string", surname: "My string", age: 2020 }`,
            credentials: `undefined`,
        },
        {
            isAuth: true,
            name: 'funcB',
            data: `{ data: new MyDTO() }`,
            credentials: `"My string"`,
        },
        {
            isAuth: true,
            name: 'funcC',
            data: `{}`,
            credentials: `2020`,
        },
        {
            isAuth: false,
            name: 'funcD',
            data: `{ data: "My string" }`,
            credentials: `undefined`,
        },
        {
            isAuth: false,
            name: 'funcE',
            data: `{ data: "My string" }`,
            credentials: `undefined`,
        },
        {
            isAuth: true,
            name: 'changeUser',
            data: `{ name: "My string", surname: "My string", player: new Player(), org: new Org() }`,
            credentials: `undefined`,
        },
    ];
    //#endregion

    //#region [ wsservice calls ]
    public async hubCall(method: string, event: string) {
        try {
            this.log(`[ui][hub] ${event}.${method}`);
            const t1 = new Date().getTime();
            switch (method) {
                case 'on':
                    (wsapi as any)[this.service][event].on((data: any) => {
                        this.log(`%c[event][${this.service}.hub] ${event}.on(...) `, 'color: aqua', data);
                        this.$notify({
                            title: 'Hub event Receive',
                            text: `${this.service}.${event}`,
                            group: 'bottom',
                        } as INotification);
                    });
                    break;
                case 'off':
                    (wsapi as any)[this.service][event].off();
                    break;
                case 'unsub':
                    await (wsapi as any)[this.service][event].unsubscribe();
                    break;
                case 'sub':
                    const hub = this.hubEvents.find(x => x.name == event);
                    if (hub) {
                        await (wsapi as any)[this.service][event].subscribe(hub.credentials);
                    } else {
                        this.error(`[response] hub event '${event}' not found`);
                    }
                    break;
            }
            const t2 = new Date().getTime();
            this.log(`[response] in ${t2 - t1} ms`);
        } catch (err) {
            this.error(`[response] `, err);
        }
    }
    public async restCall(method: string) {
        try {
            this.log(`[ui][rest] ${method}(...)`);
            const rest = this.restMethods.find(x => x.name == method);
            if (rest) {
                const t1 = new Date().getTime();
                const data = rest.data ? JSON.parse(rest.data) : undefined;
                const credentials = rest.credentials ? JSON.parse(rest.credentials) : undefined;
                const response = await wsapi.rest.requestAsync({
                    service: this.service,
                    method,
                    credentials,
                    data,
                }, 3000);
                const t2 = new Date().getTime();
                this.log(`[response] in ${t2 - t1} ms`, response);
            } else {
                this.error(`[response] rest method '${method}' not found`);
            }
        } catch (err) {
            this.error(`[response] `, err);
        }
    }
    //#endregion

    //#region [ private ]
    private log(...args: any[]) {
        console.log(`[${this.service}]`, args);
    }
    private error(...args: any[]) {
        console.log(`[${this.service}]`, ...args);
    }
}

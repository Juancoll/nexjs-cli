import './style.scss';
import { Component, Vue } from 'vue-property-decorator';
import { INotification } from '@/lib/vue/vue-notification/types/INotification';

import { wsapi } from '@/services/wsapi';

interface IHubEvent { isAuth: boolean; name: string; credentials: string; }
interface IRestMethod { isAuth: boolean; name: string; data: string; credentials: string; }

@Component({
    template: require('./template.pug'),
})
export default class {{serviceUpperName}}WSServiceView extends Vue {

    //#region [ properties ]
    public service: string = '{{serviceName}}';
    public hubEvents: IHubEvent[] = [
        {{#hubEvents}}
        {
            isAuth: {{isAuth}},
            name: '{{name}}',
            credentials: `{{&defaults.credentials}}`,
        },
        {{/hubEvents}}
    ];
    public restMethods: IRestMethod[] = [
        {{#restMethods}}
        {
            isAuth: {{isAuth}},
            name: '{{name}}',
            data: `{{&defaults.data}}`,
            credentials: `{{&defaults.credentials}}`,
        },
        {{/restMethods}}
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

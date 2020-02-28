import { IRouteMetadata } from '@/lib/router';

import HomeView from '@/views/home';
import WSMainView from '@/views/ws/main';

{{#services}}
import {{serviceUpperName}}WSServiceView from '@/views/ws/services/{{serviceName}}';
{{/services}}

import { RouteConfig } from 'vue-router';

export let routes: RouteConfig[] = [
    {
        path: '/default',
        name: 'default',
        component: HomeView,
        meta: {
            showInToolbar: true,
            showInDrawer: true,
            icon: 'mdi-home',
            iconColor: 'primary',
            title: 'Home',
            subtitle: 'default branch - home',
        } as IRouteMetadata,
    },
    {
        path: '/default/ws/main',
        name: 'default-ws-main',
        component: WSMainView,
        meta: {
            showInToolbar: false,
            showInDrawer: true,
            icon: 'mdi-power-socket',
            iconColor: 'primary',
            title: 'WS Main',
            subtitle: 'Connection and doc.',
        } as IRouteMetadata,
    },
    {{#services}}
    {
        path: '/default/ws/services/{{serviceName}}',
        name: 'default-ws-services-{{serviceName}}',
        component: {{serviceUpperName}}WSServiceView,
        meta: {
            showInToolbar: false,
            showInDrawer: true,
            icon: 'mdi-power-plug',
            iconColor: 'primary',
            title: 'WS {{serviceName}}',
            subtitle: '{{serviceUpperName}} ws service',
        } as IRouteMetadata,
    },
    {{/services}}
];

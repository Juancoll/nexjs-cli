import { IRouteMetadata } from '@/lib/router';

import WSView from '@/views/ws';

{{#services}}
import {{serviceUpperName}}WSServiceView from '@/views/ws/services/{{serviceName}}';
{{/services}}

import { RouteConfig } from 'vue-router';

export let routes: RouteConfig[] = [
    {
        path: '/ws',
        name: 'ws',
        component: WSView,
        meta: {
            showInToolbar: true,
            showInDrawer: true,
            icon: 'mdi-power-socket',
            iconColor: 'primary',
            title: 'WS',
            subtitle: 'Conn & Auth',
        } as IRouteMetadata,
    },
    {{#services}}
    {
        path: '/ws/services/{{serviceName}}',
        name: 'ws-services-{{serviceName}}',
        component: {{serviceUpperName}}WSServiceView,
        meta: {
            showInToolbar: false,
            parent: 'ws',
            showInDrawer: true,
            icon: 'mdi-power-plug',
            iconColor: 'secondary',
            title: 'WS {{serviceName}}',
            subtitle: '{{serviceUpperName}} ws service',
        } as IRouteMetadata,
    },
    {{/services}}
];

import { IRouteMetadata } from '@/lib/router';

import CommonView from '@/views/roles/commons';
import { RouteConfig } from 'vue-router';

export let routes: RouteConfig[] = [
    {
        path: '/common',
        name: 'home',
        component: CommonView,
        meta: {
            showInToolbar: true,
            showInDrawer: true,
            icon: 'mdi-home',
            iconColor: 'primary',
            title: 'home',
            subtitle: 'common route from any role',
        } as IRouteMetadata,
    },
];

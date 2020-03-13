import { IRouteMetadata } from '@/lib/router';

import HomeView from '@/views/home';

import { RouteConfig } from 'vue-router';

export let routes: RouteConfig[] = [
    {
        path: '/roles/admin',
        name: 'roles-admin',
        component: HomeView,
        meta: {
            showInToolbar: true,
            showInDrawer: true,
            icon: 'mdi-cash',
            iconColor: 'primary',
            title: 'Home',
            subtitle: 'role admin branch',
        } as IRouteMetadata,
    },
];

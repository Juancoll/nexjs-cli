import { IRouteMetadata } from '@/lib/router';

import HomeView from '@/views/home';

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
];

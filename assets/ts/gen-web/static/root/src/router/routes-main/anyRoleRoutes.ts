import { IRouteMetadata } from '@/lib/router';

import { RouteConfig } from 'vue-router';

import HomeView from '@/views/home';

export let routes: RouteConfig[] = [
    {
        path: '/any',
        name: 'any',
        component: HomeView,
        meta: {
            showInToolbar: true,
            showInDrawer: true,
            icon: 'mdi-home',
            iconColor: 'primary',
            title: 'Home',
            subtitle: 'any branch - home',
        } as IRouteMetadata,
    },
];

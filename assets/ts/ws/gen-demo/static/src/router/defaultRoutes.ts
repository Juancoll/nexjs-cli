import { IRouteMetadata } from '@/lib/router';

import HomeView from '@/views/home';
import WSMainView from '@/views/ws/main';

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
];

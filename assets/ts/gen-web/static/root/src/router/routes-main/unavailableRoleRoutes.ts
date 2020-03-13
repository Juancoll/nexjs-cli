import { IRouteMetadata } from '@/lib/router';

import HomeView from '@/views/home';
import { RouteConfig } from 'vue-router';

export let routes: RouteConfig[] = [
    {
        path: '/unavailableRole',
        name: 'unavailableRole',
        component: HomeView,
        meta: {
            showInToolbar: true,
            showInDrawer: true,
            icon: 'mdi-home',
            iconColor: 'primary',
            title: 'home',
            subtitle: 'unavailableRole branch - home',
        } as IRouteMetadata,
    },
];

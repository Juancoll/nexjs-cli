import { IRouteMetadata } from '@/lib/router';

import HomeView from '@/views/home';

import { RouteConfig } from 'vue-router';

export let routes: RouteConfig[] = [
    {
        path: '/roles/user',
        name: 'roles-user',
        component: HomeView,
        meta: {
            showInToolbar: true,
            showInDrawer: true,
            icon: 'mdi-cash',
            iconColor: 'primary',
            title: 'Home',
            subtitle: 'role user branch',
        } as IRouteMetadata,
    },
];

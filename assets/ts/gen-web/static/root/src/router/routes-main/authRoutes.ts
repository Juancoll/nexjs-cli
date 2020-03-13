import { IRouteMetadata } from '@/lib/router';

import { RouteConfig } from 'vue-router';
import LoginView from '@/views/auth/login';
import RegisterView from '@/views/auth/register';

export let routes: RouteConfig[] = [
    {
        path: '/auth/login',
        name: 'login',
        component: LoginView,
        meta: {
            showInToolbar: false,
            showInDrawer: false,
            icon: 'mdi-account',
            iconColor: 'primary',
            title: 'login',
            subtitle: 'login page',
        } as IRouteMetadata,
    },
    {
        path: '/auth/register',
        name: 'register',
        component: RegisterView,
        meta: {
            showInToolbar: false,
            showInDrawer: false,
            icon: 'mdi-account',
            iconColor: 'primary',
            title: 'register',
            subtitle: 'register page',
        } as IRouteMetadata,
    },
];

import { IRouteMetadata } from '@/lib/router';

import HomeView from '@/views/home';
import WSMainView from '@/views/ws/main';
import WSDocView from '@/views/ws/doc';

import DemoWSServiceView from '@/views/ws/services/demo';
import CustomWSServiceView from '@/views/ws/services/custom';
import DbWSServiceView from '@/views/ws/services/db';
import JobsWSServiceView from '@/views/ws/services/jobs';
import OrgsWSServiceView from '@/views/ws/services/orgs';
import UsersWSServiceView from '@/views/ws/services/users';

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
        path: '/default/ws/doc',
        name: 'default-ws-doc',
        component: WSDocView,
        meta: {
            showInToolbar: true,
            showInDrawer: true,
            icon: 'mdi-file-document-box',
            iconColor: 'primary',
            title: 'WS Doc',
            subtitle: 'documentation',
        } as IRouteMetadata,
    },
    {
        path: '/default/ws/main',
        name: 'default-ws-main',
        component: WSMainView,
        meta: {
            showInToolbar: true,
            showInDrawer: true,
            icon: 'mdi-power-socket',
            iconColor: 'primary',
            title: 'WS Main',
            subtitle: 'Connection and authentication',
        } as IRouteMetadata,
    },
    {
        path: '/default/ws/services/demo',
        name: 'default-ws-services-demo',
        component: DemoWSServiceView,
        meta: {
            showInToolbar: false,
            showInDrawer: true,
            icon: 'mdi-power-plug',
            iconColor: 'primary',
            title: 'WS demo',
            subtitle: 'Demo ws service',
        } as IRouteMetadata,
    },
    {
        path: '/default/ws/services/custom',
        name: 'default-ws-services-custom',
        component: CustomWSServiceView,
        meta: {
            showInToolbar: false,
            showInDrawer: true,
            icon: 'mdi-power-plug',
            iconColor: 'primary',
            title: 'WS custom',
            subtitle: 'Custom ws service',
        } as IRouteMetadata,
    },
    {
        path: '/default/ws/services/db',
        name: 'default-ws-services-db',
        component: DbWSServiceView,
        meta: {
            showInToolbar: false,
            showInDrawer: true,
            icon: 'mdi-power-plug',
            iconColor: 'primary',
            title: 'WS db',
            subtitle: 'Db ws service',
        } as IRouteMetadata,
    },
    {
        path: '/default/ws/services/jobs',
        name: 'default-ws-services-jobs',
        component: JobsWSServiceView,
        meta: {
            showInToolbar: false,
            showInDrawer: true,
            icon: 'mdi-power-plug',
            iconColor: 'primary',
            title: 'WS jobs',
            subtitle: 'Jobs ws service',
        } as IRouteMetadata,
    },
    {
        path: '/default/ws/services/orgs',
        name: 'default-ws-services-orgs',
        component: OrgsWSServiceView,
        meta: {
            showInToolbar: false,
            showInDrawer: true,
            icon: 'mdi-power-plug',
            iconColor: 'primary',
            title: 'WS orgs',
            subtitle: 'Orgs ws service',
        } as IRouteMetadata,
    },
    {
        path: '/default/ws/services/users',
        name: 'default-ws-services-users',
        component: UsersWSServiceView,
        meta: {
            showInToolbar: false,
            showInDrawer: true,
            icon: 'mdi-power-plug',
            iconColor: 'primary',
            title: 'WS users',
            subtitle: 'Users ws service',
        } as IRouteMetadata,
    },
];

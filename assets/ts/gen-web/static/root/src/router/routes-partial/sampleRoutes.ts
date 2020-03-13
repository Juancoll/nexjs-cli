import { IRouteMetadata } from '@/lib/router';

import SamplesView from '@/views/samples';
import DynamicRouteView from '@/views/samples/views/dynamicRoute';
import MarkdownView from '@/views/samples/views/markdown';

import { RouteConfig } from 'vue-router';

export let routes: RouteConfig[] = [
    {
        path: '/samples',
        name: 'samples',
        component: SamplesView,
        meta: {
            showInToolbar: false,
            showInDrawer: true,
            icon: 'mdi-account',
            iconColor: 'primary',
            title: 'Samples',
            subtitle: 'Samples',
        } as IRouteMetadata,
        children: [
            {
                path: '/samples/dynamic/:id/*/:name',
                name: 'samples-dynamic',
                component: DynamicRouteView,
                meta: {
                    parent: 'samples',
                    showInToolbar: false,
                    showInDrawer: true,
                    icon: 'mdi-account',
                    iconColor: 'secondary',
                    title: 'Dynamic Route',
                    subtitle: 'Samples',
                } as IRouteMetadata,
            },
            {
                path: '/samples/markdown',
                name: 'samples-markdown',
                component: MarkdownView,
                meta: {
                    parent: 'samples',
                    showInToolbar: false,
                    showInDrawer: true,
                    icon: 'mdi-power-socket',
                    iconColor: 'secondary',
                    title: 'Markdown',
                    subtitle: 'MD to Html from file',
                } as IRouteMetadata,
            },
        ],
    },
];

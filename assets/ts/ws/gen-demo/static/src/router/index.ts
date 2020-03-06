import Vue from 'vue';
import Router from 'vue-router';
import { VueRouterExtended } from '@/lib/router';

import { routes as loginRoutes } from './authRoutes';
import { routes as defaultRoutes } from './defaultRoutes';
import { routes as anyRoutes } from './anyRoleRoutes';
import { routes as unavailableRoutes } from './unavailableRoleRoutes';

import { routes as commonRoutes } from './roles/commonRoutes';
import { routes as adminRoutes } from './roles/adminRoutes';
import { routes as workerRoutes } from './roles/workerRoutes';

Vue.use(Router);

const router = new VueRouterExtended({/*  auth: { useDefault: true, useRoles: false } */ auth: undefined, options: { mode: 'hash' } });
router.setBranches({
    default: {
        name: 'default',
        routes: defaultRoutes,
        startup: '/default/ws/main',
    },
    authenticate: {
        anyRole: {
            name: 'anyRole',
            routes: anyRoutes,
            startup: '/any',
        },
        commonForRoles: commonRoutes,
        auth: {
            name: 'auth',
            routes: loginRoutes,
            startup: '/auth/login',
        },
        unavailableRole: {
            name: 'unavailableRole',
            routes: unavailableRoutes,
            startup: '/unavailableRole',
        },
        roles: {
            admin: {
                name: 'role-admin',
                routes: adminRoutes,
                startup: '/roles/admin',
            },
            worker: {
                name: 'role-worker',
                routes: workerRoutes,
                startup: '/roles/worker',
            },
        },
    },
});

router.onBranchChange.sub(e => {
    console.log(`[router] onBranchChange({from: '${e.from ? e.from.name : 'undefined'}', to: '${e.to.name}')`);
});
router.onRouteChange.sub(e => {
    console.log(`[router] onRouteChange({from: '${e.from ? e.from.path : 'undefined'}', to: '${e.to.path}')`);
});
router.onBeforeEach.sub(e => {
    console.log(`[router] onBeforeEach({from: '${e.from ? e.from.path : 'undefined'}', to: '${e.to.path}')`);
});
router.onAfterEach.sub(e => {
    console.log(`[router] onAfterEach({from: '${e.from ? e.from.path : 'undefined'}', to: '${e.to.path}')`);
});

(window as any).router = router;
export default router;

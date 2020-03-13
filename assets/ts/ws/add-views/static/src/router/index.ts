import Vue from 'vue';
import Router from 'vue-router';
import { VueRouterExtended } from '@/lib/router';

import { routes as loginRoutes } from './routes-main/authRoutes';
import { routes as defaultRoutes } from './routes-main/defaultRoutes';
import { routes as anyRoutes } from './routes-main/anyRoleRoutes';
import { routes as unavailableRoutes } from './routes-main/unavailableRoleRoutes';

import { routes as commonRoutes } from './routes-main/roles/commonRoutes';
import { routes as adminRoutes } from './routes-main/roles/adminRoutes';
import { routes as userRoutes } from './routes-main/roles/userRoutes';

import { routes as samplesRoutes } from './routes-partial/sampleRoutes';
import { routes as wsRoutes } from './routes-partial/wsRoutes';

Vue.use(Router);

const router = new VueRouterExtended({ auth: { useDefault: true, useRoles: false }, options: { mode: 'hash' } });
router.setBranches({
    default: {
        name: 'default',
        routes: defaultRoutes
            .concat(samplesRoutes)
            .concat(wsRoutes),
        startup: '/default',
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
                name: 'role-user',
                routes: userRoutes,
                startup: '/roles/user',
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

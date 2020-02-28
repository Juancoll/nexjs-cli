import './style.scss';

import Vue from 'vue';
import Component from 'vue-class-component';
import { RouteConfig } from 'vue-router';

import { env } from '@/services/env';
import { eventService, EventKeys as E } from '@/services/events';
import router from '@/router';
import { RouterTools, IBranch, BranchEventArgs } from '@/lib/router';

import RouterMenuItem from './components/RouterMenuItem';
import { authApp } from '@/services/auth';
import { IAuthUser } from '@/lib/auth';

// Register recursive component as global (for production mode)
Vue.component('RouterMenuItem', RouterMenuItem);
@Component({
    template: require('./template.pug'),
})
export default class RootView extends Vue {

    //#region [ data ]
    public logo = require('../../assets/img/logo.png');
    public title: string = 'web app template';
    public showDrawer: boolean = false;
    public footer = {
        left: '<span style=\'color:red\'><b>STATUS</b></span>',
        center: '',
        right: '&copy; trademark',
    };
    public userValidRoles: string[] = [];
    public showUserMenu: boolean = true;
    public showRolesInMenu: boolean = false;
    public drawerEnabled: boolean = false;
    public drawerRoutes: RouteConfig[] = [];
    public toolbarRoutes: RouteConfig[] = [];
    public auth = authApp;
    //#endregion

    //#region  [ computed ]
    public get mode() {
        const mode = env.vars.mode as string;
        if (mode == 'production') {
            return '';
        }
        return `(${mode})`;
    }
    //#endregion

    constructor(options: any) {
        super(options);
        console.log('[RootView] constructor');
    }

    //#region  [ methods ]
    goToRoute(route: RouteConfig) {
        router.pushIfNotCurrent(route.path);
    }
    toggleDrawer() {
        this.showDrawer = !this.showDrawer;
    }
    resize() {
        eventService.$emit(E.toolbar.center, JSON.stringify({ x: window.innerWidth, y: window.innerHeight }));
    }
    logout() {
        authApp.logout();
    }
    login() {
        router.pushIfNotCurrent('/auth/login');
    }
    changeRole(role: string) {
        router.updateRole(role);
    }
    //#endregion

    //#region [ handlers ]
    private onUpdateUser(user?: IAuthUser | null) {
        router.updateUser(user);
        this.userValidRoles = !user
            ? []
            : router.userValidRoles;
        this.setUserMenuVisibilities();
    }
    private onRouterBranchChange(e: BranchEventArgs) {
        const routes = e.to.routes;
        this.drawerRoutes = RouterTools.flatRoutes(routes).filter((x: RouteConfig) => x.meta && x.meta.showInDrawer);
        this.toolbarRoutes = RouterTools.flatRoutes(routes).filter((x: RouteConfig) => x.meta && x.meta.showInToolbar);
    }
    //#endregion

    //#region  [ private ]
    private setUserMenuVisibilities() {
        this.showRolesInMenu = router.useAuth && router.useRoles && authApp.isAuth && this.userValidRoles.length > 1;
    }
    //#endregion

    //#region [ Vue ]
    mounted() {

        const self = this;
        router.onRouteChange.sub(e => {
            self.showUserMenu = router.useAuth && !router.isAuthRoute;
            self.drawerEnabled = router.isAuthRoute && !router.useDefault
                ? false
                : self.drawerRoutes.length > 0
                    ? true
                    : false;
        });

        authApp.onAuthenticate.sub(this.onUpdateUser);
        router.onBranchChange.sub(this.onRouterBranchChange);

        eventService.$on(E.toolbar.left, (data: string) => this.$set(this.footer, 'left', data));
        eventService.$on(E.toolbar.center, (data: string) => this.$set(this.footer, 'center', data));
        eventService.$on(E.toolbar.right, (data: string) => this.$set(this.footer, 'right', data));

        this.resize();
        this.onUpdateUser(authApp.user);
    }

    destroyed() {
        authApp.onAuthenticate.unsub(this.onUpdateUser);
        router.onBranchChange.unsub(this.onRouterBranchChange);
    }
    //#endregion
}

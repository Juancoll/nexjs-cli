import Router, { RouterOptions, RouteConfig, Route } from 'vue-router';
import { SimpleEventDispatcher } from 'strongly-typed-events';
import { IAuthUser } from '@/lib/auth';

export interface IAuthOptions {
    useDefault: boolean;
    useRoles: boolean;
}

export interface IBranch {
    name: string;
    routes: RouteConfig[];
    startup: string;
}

export interface IVueRouterExtendedProps {
    auth: IAuthOptions | undefined | null;
    options?: RouterOptions;
}

export interface IBranches {
    default?: IBranch;
    authenticate?: {
        auth?: IBranch;
        anyRole?: IBranch;
        commonForRoles?: RouteConfig[];
        unavailableRole?: IBranch,
        roles?: { [key: string]: IBranch };
    };
}

export interface BranchEventArgs {
    from: IBranch | undefined;
    to: IBranch;
}
export interface RouteEventArgs {
    from: RouteConfig | undefined;
    to: RouteConfig;
}

export class VueRouterExtended extends Router {
    //#region [ fields ]
    private _firstTime = true;
    private _branches: IBranches;
    private _currentBranch: IBranch;
    private _currentRoute: RouteConfig;
    private _roles: string[] = [];
    private _currentRole: string | undefined;
    private _user: IAuthUser | null | undefined;
    //#endregion

    //#region [ properties ]
    public readonly useAuth: boolean;
    public readonly useRoles: boolean;
    public readonly useDefault: boolean;
    public get isAuthRoute(): boolean {
        if (!this._branches.authenticate || !this._branches.authenticate.auth) {
            return false;
        }
        const result = this._branches.authenticate.auth.routes
            .map(x => x.path)
            .indexOf(this.currentRoute.path) > -1;
        return result;
    }
    //#endregion

    //#region [ events ]
    public onBranchChange = new SimpleEventDispatcher<BranchEventArgs>();
    public onRouteChange = new SimpleEventDispatcher<RouteEventArgs>();
    public onBeforeEach = new SimpleEventDispatcher<RouteEventArgs>();
    public onAfterEach = new SimpleEventDispatcher<RouteEventArgs>();
    //#endregion

    //#region [ constructor ]
    constructor(props: IVueRouterExtendedProps) {
        super(props.options);

        this.useAuth = props.auth ? true : false;
        this.useRoles = props.auth ? props.auth.useRoles : false;
        this.useDefault = props.auth ? props.auth.useDefault : false;

        const self = this;
        (this as any).beforeEach((to: Route, from: Route, next: any) => {
            if (self._firstTime) {
                self._firstTime = false;
                next(false);
            } else {
                const route: RouteConfig | undefined = self.findRoute(self._currentBranch.routes, to.path);
                if (route) {
                    self.onBeforeEach.dispatch({ to: to as RouteConfig, from: from as RouteConfig });
                    next();
                } else {
                    self.onBeforeEach.dispatch({ to: to as RouteConfig, from: from as RouteConfig });
                    next(self._currentBranch.startup);
                }
            }
        });
        (this as any).afterEach((to: Route, from: Route) => {
            const oldValue = self._currentRoute ? self._currentRoute : undefined;
            const newValue = to;
            self._currentRoute = to as RouteConfig;
            if (!oldValue || oldValue.path != newValue.path) {
                self.onRouteChange.dispatch({ from: oldValue, to: newValue as RouteConfig });
            }
            self.onAfterEach.dispatch({ to: to as RouteConfig, from: from as RouteConfig });
        });
    }
    //#endregion

    //#region  [ public ]
    public setBranches(branches: IBranches) {
        if (!branches) {
            throw new Error('can\'t be undefined or null');
        }

        // set routes
        this._branches = branches;

        // Update role routes if commonForRole exists
        if (this._branches.authenticate &&
            this._branches.authenticate.commonForRoles) {
            if (!this._branches.authenticate.roles) { throw new Error('"authenticate.commonForRoles" branches required roles branch definition'); }
            for (const key in this._branches.authenticate.roles) {
                if (key) {
                    this._branches.authenticate.roles[key].routes = this._branches.authenticate.commonForRoles
                        .concat(this._branches.authenticate.roles[key].routes);
                }
            }
        }

        // set avalaible roles
        if (this._branches.authenticate && this._branches.authenticate.roles) {
            const roles = Object.keys(this._branches.authenticate.roles);
            if (roles.length == 0) { throw new Error('authenticate.roles is empty'); }
            this._roles = roles;
        }
    }

    public get userValidRoles(): string[] {
        return !this._user
            ? []
            : this._user.roles.filter(x => this.roles.indexOf(x) != -1);
    }

    public get roles(): string[] {
        return this._roles;
    }
    public updateUser(user?: IAuthUser | null) {
        this._user = user;
        this.updateRole(this._user ? this.userValidRoles[0] : undefined);
    }
    public updateRole(role?: string) {

        const oldBranch = this._currentBranch;

        if (!this._branches) { throw new Error('setBranches(...) required'); }
        if (role && this._currentRole == role) {
            // nothing to change
            return;
        }

        if (!this.useAuth) {
            if (!this._branches.default) { throw new Error('"default" branch required'); }
            this._currentBranch = this._branches.default;
        } else {
            if (!this._branches.authenticate) { throw new Error('"authenticate" branch required'); }
            if (!this._user) {
                if (!this._branches.authenticate.auth) { throw new Error('"authenticate.login" branch required'); }
                if (this.useDefault) {
                    if (!this._branches.default) { throw new Error('"default" branch required'); }
                    this._currentBranch = {
                        name: `${this._branches.default.name} + ${this._branches.authenticate.auth.name}`,
                        startup: this._branches.default.startup,
                        routes: this._branches.default.routes.concat(this._branches.authenticate.auth.routes),
                    };
                } else {
                    this._currentBranch = this._branches.authenticate.auth;
                }
            } else {
                if (!this.useRoles) {
                    if (!this._branches.authenticate.anyRole) { throw new Error('"authenticate.anyRole" branch required'); }
                    this._currentBranch = this._branches.authenticate.anyRole;
                } else {
                    if (!role) { throw new Error('role can\'t undefined or null'); }
                    if (!this._branches.authenticate.roles) { throw new Error('"authenticate.roles" branch required '); }
                    if (!this._branches.authenticate.roles[role]) {
                        if (!this._branches.authenticate.unavailableRole) {
                            throw new Error('"authenticate.unavailableRole" branch required');
                        }
                        this._currentBranch = this._branches.authenticate.unavailableRole;
                    } else {
                        this._currentBranch = this._branches.authenticate.roles[role];
                    }
                }
            }
        }

        this._currentRole = role;
        this.replaceRoutes(this._currentBranch.routes);
        this.onBranchChange.dispatch({ from: oldBranch, to: this._currentBranch });
        this.push({ path: this._currentBranch.startup })
            .catch();
    }

    pushIfNotCurrent(path: string) {
        if (this.currentRoute.path != path) {
            this.push({ path });
        }
    }
    //#endregion

    //#region  [ private ]
    private replaceRoutes(routes: RouteConfig[] | undefined) {
        const newRouter = new Router({
            mode: 'history',
            routes: routes || [],
        });
        (this as any).options = (newRouter as any).options;
        (this as any).matcher = (newRouter as any).matcher;
    }
    private findRoute(routes: RouteConfig[], path: string): RouteConfig | undefined {
        for (const route of routes) {
            if (route) {
                const found = this.findPathInRoute(route, path);
                if (found) {
                    return found;
                }
            }
        }
        return undefined;
    }
    private findPathInRoute(route: RouteConfig, path: string): RouteConfig | undefined {
        if (route.path == path) {
            return route;
        } else if (route.children && route.children.length > 0) {
            for (const child of route.children) {
                if (child) {
                    const found = this.findPathInRoute(child, path);
                    if (found) {
                        return found;
                    }
                }
            }
        }
        return undefined;
    }
    //#endregion
}

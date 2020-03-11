import { RouteConfig } from 'vue-router';

export class RouterTools {
    public static flatRoutes(routes: RouteConfig[] | undefined): RouteConfig[] {
        const copy = JSON.parse(JSON.stringify(routes)) as RouteConfig[];
        if (!copy) {
            return [];
        }
        let list = new Array<RouteConfig>();
        copy.forEach(route => {
            list.push(route);
            if (route.children) {
                list = list.concat(RouterTools.flatRoutes(route.children));
                delete route.children;
            }
        });
        return list;
    }
    public static createMenuRoutes(routes: RouteConfig[]): RouteConfig[] {

        const routesCopy = JSON.parse(JSON.stringify(routes)) as RouteConfig[];

        const flat = RouterTools.flatRoutes(routesCopy);
        const list = new Array<RouteConfig>();
        flat.forEach(route => {
            if (!route.meta.parent) {
                list.push(route);
            } else {
                const parent = flat.find(x => x.name == route.meta.parent);
                if (!parent) {
                    console.error(`parent ${route.meta.parent} not found in route ${route.name}`);
                } else {
                    if (!parent.children) {
                        parent.children = new Array<RouteConfig>();
                    }
                    parent.children.push(route);
                }
            }
        });
        return list;
    }
}

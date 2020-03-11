# visual studio code 
- install Debugger for Chrome
- install Todo Tree
- install Vetur
- install indent-rainbow

# npm scripts
| script | description |
|--      |--           |
|serve   | run development mode (incremental build)  |
|serve:production   | serve with production env variables (.env.production file)  |
|serve:staging   | serve with staging env variables (.env.staging file)  |
|build:production   | create distribution (dist folder) with .env.production file |
|build:staging   | create distribution (dist folder) with .env.staging file |
|start   | start server (npm serve package) to dist folder. test purpose  |
|lint   | apply tslint (tslint.json file)  |
|authorize   |  authorize artifact packages (private package repository) |

# debug
- execute command 'npm run serve'
- in vscode launch debug command 'Launch Chrome against localhost' or F5

# description
genetic template to create web applications with 
- lateral drawer with 2 levels of items
- app bar links
- notification system
- status bar
- router options

| options  | descriptions  |
|--|--|
| with login based on user roles |  require login and each role has its own router views   |
| with login for any roles   |  require login and all roles have same router views  |
| no login   |  unique  router views |

# file system


# configuration 
## In src/router
- index.ts: define routes strategy creating the router 
- create custom routes files (you can follow the current nomenclature)

| folder | routes |
|-- |-- |
| src/router/ | create defaultRoutes.ts or anyRoleRoutes.ts or loginRoutes.ts or unavailableRoutes.ts  |
| src/router/roles/ | create commonRoutes.ts and [role]Routes.ts foeach role |

## In src/services/api/index.ts
- uncomment the correct api
- remove other client apis

## branches (routes group) strategy

``` javascript

// BranchRoutes must contains the vue routes and the startup path to begin o fallback.
export interface IBranch {
    routes: RouteConfig[];
    startup: string;
}

// Brances struture for router
export interface IBranches {
    default?: IBranch;
    authenticate?: {
        login?: IBranch;
        anyRole?: IBranch;
        commonForRoles?: RouteConfig[];
        unavailableRole?: IBranch,
        roles?: { [key: string]: IBranch };
    };
}

// Logic
let currentUserRole = "";

if (!useLogin) {
        return default
} else {
    if (!isAuthenticate) {
        return login;
    } else {
        if (!this.useRoles) {
            return anyRole
        } else {
            if (!contains(currentUser)) {
                return unavailableRole;
            } else {
                return roles[role]
            }
        }
    }
}
```



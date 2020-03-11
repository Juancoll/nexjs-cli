export class Environment {

    vars: {
        mode: string;
        i18n: {
            locale: string,
            fallback_local: string,
        },
        wsapi: {
            url: string;
            path: string;
            nsp: string;
        },
        defaults: {
            login: {
                user: {
                    email: string;
                    password: string;
                }
                player: {
                    name: string;
                    serial: string;
                },
            },
        }
    };

    create() {
        this.vars = {
            mode: this.var('VUE_APP_MODE'),
            i18n: {
                locale: this.var('VUE_APP_I18N_LOCALE'),
                fallback_local: this.var('VUE_APP_I18N_FALLBACK_LOCALE'),
            },
            wsapi: {
                url: this.var('VUE_APP_WSAPI_URL'),
                path: this.var('VUE_APP_WSAPI_PATH'),
                nsp: this.var('VUE_APP_WSAPI_NSP'),
            },
            defaults: {
                login: {
                    user: {
                        email: this.var('VUE_APP_LOGIN_DEFAULT_USER_EMAIL'),
                        password: this.var('VUE_APP_LOGIN_DEFAULT_USER_PASSWORD'),
                    },
                    player: {
                        name: this.var('VUE_APP_LOGIN_DEFAULT_PLAYER_NAME'),
                        serial: this.var('VUE_APP_LOGIN_DEFAULT_PLAYER_SERIAL'),
                    },
                },
            },
        };
    }
    check() {
        this.checkExists('VUE_APP_MODE');
        this.checkExists('VUE_APP_I18N_LOCALE');
        this.checkExists('VUE_APP_I18N_FALLBACK_LOCALE');
    }
    print() {
        // console.log('[Environment Variables]', this.vars);
    }

    private checkExists(name: string): void {
        if (!process.env[name]) {
            throw new Error(`Environment variable '${name}' not found`);
        }
    }
    private var(name: string): string {
        return process.env[name] as string;
    }
}

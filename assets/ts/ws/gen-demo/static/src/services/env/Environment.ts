export class Environment {

    vars: {
        mode: string;
        i18n: {
            locale: string,
            fallback_local: string,
        },
        api: {
            url: string;
        }
        wsapi: {
            url: string;
            path: string;
            nsp: string;
        },
        defaults: {
            login: {
                email: string;
                password: string;
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
            api: {
                url: this.var('VUE_APP_API_URL'),
            },
            wsapi: {
                url: this.var('VUE_APP_WSAPI_URL'),
                path: this.var('VUE_APP_WSAPI_PATH'),
                nsp: this.var('VUE_APP_WSAPI_NSP'),
            },
            defaults: {
                login: {
                    email: this.var('VUE_APP_LOGIN_DEFAULT_EMAIL'),
                    password: this.var('VUE_APP_LOGIN_DEFAULT_PASSWORD'),
                },
            },
        };
    }
    check() {
        this.checkExists('VUE_APP_MODE');
        this.checkExists('VUE_APP_I18N_LOCALE');
        this.checkExists('VUE_APP_I18N_FALLBACK_LOCALE');
        this.checkExists('VUE_APP_API_URL');
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

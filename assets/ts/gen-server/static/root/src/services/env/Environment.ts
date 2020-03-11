import { readFileSync } from 'fs';
import { resolve } from 'path';

import { PackageJson } from './packageJson.type';

export interface IEnvironmentVariables {
    port?: string;
    crypt: {
        jwt_secret: string,
        jwt_expiresIn: string,
        salt_rounds: string,
    };
    server: {
        port: string,
        host: string,
        api: {
            base_path: string,
            doc_path: string,
        },
    };
    db:
    {
        main: {
            connectionString: string,
            dbName: string,
        },
        analytics: {
            connectionString: string,
            dbName: string,
        },
        support: {
            connectionString: string,
            dbName: string,
        },
        feedback: {
            connectionString: string,
            dbName: string,
        },
    };
}

export class Environment {
    package: PackageJson;
    listenPort?: string;
    vars: IEnvironmentVariables;

    create() {
        const packageJson = readFileSync(resolve(__dirname, '../../../package.json'), 'utf8');
        this.package = new PackageJson(JSON.parse(packageJson));

        this.listenPort = this.var('PORT') || this.var('SERVER_PORT');

        this.vars = {
            port: this.var('PORT'),
            crypt: {
                jwt_secret: this.var('JWT_SECRET'),
                jwt_expiresIn: this.var('JWT_EXPIRESIN'),
                salt_rounds: this.var('CRYPT_SALT_ROUNDS'),
            },
            server: {
                port: this.var('SERVER_PORT'),
                host: this.var('SERVER_HOST'),
                api: {
                    base_path: this.var('SERVER_API_BASE_PATH'),
                    doc_path: this.var('SERVER_API_DOC_PATH'),
                },
            },
            db: {
                main: {
                    connectionString: this.var('DB_MAIN_CONNECTION_STRING'),
                    dbName: this.var('DB_MAIN_MONGODB_DBNAME'),
                },
                analytics: {
                    connectionString: this.var('DB_ANALYTICS_CONNECTION_STRING'),
                    dbName: this.var('DB_ANALYTICS_MONGODB_DBNAME'),
                },
                support: {
                    connectionString: this.var('DB_SUPPORT_CONNECTION_STRING'),
                    dbName: this.var('DB_SUPPORT_MONGODB_DBNAME'),
                },
                feedback: {
                    connectionString: this.var('DB_FEEDBACK_CONNECTION_STRING'),
                    dbName: this.var('DB_FEEDBACK_MONGODB_DBNAME'),
                },
            },
        };
    }
    check() {
        this.checkExists('JWT_SECRET');
        this.checkExists('JWT_EXPIRESIN');
        this.checkExists('CRYPT_SALT_ROUNDS');

        this.checkExists('SERVER_API_BASE_PATH');
        this.checkExists('SERVER_API_DOC_PATH');

        this.checkExists('DB_MAIN_CONNECTION_STRING');
        this.checkExists('DB_MAIN_MONGODB_DBNAME');

        this.checkExists('DB_ANALYTICS_CONNECTION_STRING');
        this.checkExists('DB_ANALYTICS_MONGODB_DBNAME');

        this.checkExists('DB_SUPPORT_CONNECTION_STRING');
        this.checkExists('DB_SUPPORT_MONGODB_DBNAME');

        this.checkExists('DB_FEEDBACK_CONNECTION_STRING');
        this.checkExists('DB_FEEDBACK_MONGODB_DBNAME');
    }
    print() {
        console.log('Environment mode = ', process.env.NODE_ENV);
        console.log(`serve sta on ${this.vars.server.host}:${this.listenPort}`);
        console.log(`serve api on ${this.vars.server.host}:${this.listenPort}/${this.vars.server.api.base_path}`);
        console.log(`serve doc on ${this.vars.server.host}:${this.listenPort}/${this.vars.server.api.doc_path}`);
    }

    private checkExists(name: string) {
        if (!process.env[name]) {
            throw new Error(`Env variable ${name} not found`);
        }
    }
    private var(name: string) {
        return process.env[name] || '';
    }
}

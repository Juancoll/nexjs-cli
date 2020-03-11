import { Logger } from '@nestjs/common';

import { env } from '@/services/env';

import { DBManager } from './DBManager';
import { MainDBProvider, AnalyticsDBProvider, SupportDBProvider, FeedbackDBProvider } from './db.providers';

const logger = new Logger('service db');
export let db: DBManager;
export const initialize = () => {

    logger.log(`set main as ${env.vars.db.main.connectionString}`);
    db = new DBManager('main', new MainDBProvider({
        connectionString: env.vars.db.main.connectionString,
        dbName: env.vars.db.main.dbName,
    }));

    logger.log(`set analytics as ${env.vars.db.analytics.connectionString}`);
    db.register('analytics', new AnalyticsDBProvider({
        connectionString: env.vars.db.analytics.connectionString,
        dbName: env.vars.db.analytics.dbName,
    }));

    logger.log(`set support as ${env.vars.db.support.connectionString}`);
    db.register('support', new SupportDBProvider({
        connectionString: env.vars.db.support.connectionString,
        dbName: env.vars.db.support.dbName,
    }));

    logger.log(`set feedback as ${env.vars.db.feedback.connectionString}`);
    db.register('feedbasck', new FeedbackDBProvider({
        connectionString: env.vars.db.feedback.connectionString,
        dbName: env.vars.db.feedback.dbName,
    }));

    db.onConnected.sub(provider => logger.log(`[${provider._type}] onConnected`));
    db.onReconnected.sub(provider => logger.log(`[${provider._type}] onReconnected`));
    db.onDisconnected.sub(provider => logger.log(`[${provider._type}] onDisconnected`));
    db.onHostsChange.sub(provider => logger.log(`[${provider._type}] onHostsChange`));
    db.onError.sub((provider, err) => logger.error(`[${provider._type}] onError: ${err.message}`));
    db.onReconnecting.sub((provider) => logger.log(`[${provider._type}] onReconnecting`));
};

export * from './DBManager';
export * from './db.providers';

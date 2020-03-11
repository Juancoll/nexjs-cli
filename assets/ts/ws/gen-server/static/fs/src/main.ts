import 'module-alias/register';

import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common/pipes';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { writeFileSync } from 'fs';
import { resolve } from 'path';
import * as helmet from 'helmet';
import * as morgan from 'morgan';

// tslint:disable-next-line: no-var-requires
const agendash = require('agendash');

import { AppModule } from './app.module';
import { env } from './services/env';
import { jobs } from './services/jobs';
import * as dbService from './services/db';

export async function bootstrap() {
    const logger = new Logger('main');
    const app = await NestFactory.create(AppModule);

    //#region [ global api config ]
    // cors
    logger.log('enable cors');
    app.enableCors({
        origin: true,
        optionsSuccessStatus: 200,
        credentials: true,
    });

    app.use(helmet());
    app.use(morgan('tiny', { skip: ((req: any) => req.url.startsWith('/socket.io')) }));

    logger.log(`set global prefix ${env.vars.server.api.base_path}`);
    app.setGlobalPrefix(env.vars.server.api.base_path);

    logger.log('use global pipes');
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    logger.log('use websocket adapter (socket.io)');
    app.useWebSocketAdapter(new IoAdapter(app));
    //#endregion

    //#region [services DB and jobs ]
    logger.log('initialize DB');
    dbService.initialize();
    dbService.db.main.onConnected.sub(async () => {
        const jobsCollection = 'jobs';
        jobs.initializeFromInstance(dbService.db.main.conn.db, jobsCollection);
        await jobs.start();
        jobs.logger.log(`register agendash in '/${jobsCollection}' (ui for agenda jobs manager)`);
        app.use(
            `/${jobsCollection}`,
            (req: any, res: any, next: () => void) => {
                // if (!req.user) {
                //     res.sendStatus(401);
                // } else {
                //     next();
                // }
                next();
            },
            agendash(jobs.agenda),
        );
    });
    await dbService.db.connect();
    //#endregion

    //#region [ swagger ]
    logger.log('initialize  swagger');
    const options = new DocumentBuilder()
        .addServer('http://localhost:3000')
        .addServer('https://api-v1.training.nodall.io')
        .addServer('https://api-v1-staging.training.nodall.io')
        .setTitle(env.package.name)
        .setDescription(env.package.description)
        .setVersion(env.package.version)
        .addBearerAuth({ name: 'Authorization', in: 'header', type: 'apiKey' })
        .build();
    const document = SwaggerModule.createDocument(app, options);

    const path = resolve(__dirname, 'swagger-spec.json');
    logger.log(`Write swagger definition file: ${path}`);
    writeFileSync(path, JSON.stringify(document));

    SwaggerModule.setup(env.vars.server.api.doc_path, app, document);
    //#endregion

    await app.listen(env.listenPort);
}
bootstrap();

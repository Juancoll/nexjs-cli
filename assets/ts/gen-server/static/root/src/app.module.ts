import { join } from 'path';
import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { AppGateway } from './app.gateway';
import { env } from './services/env';
import { DemoContract } from './contracts/demo.contract';
import { DBContract } from './contracts/db.contract';
import { JobsContract } from './contracts/jobs.contract';
import { OrgsContract } from './contracts/orgs.contract';
import { UsersContract } from './contracts/users.contract';

@Module({
  imports: [
    ServeStaticModule.forRoot({ rootPath: join(__dirname, '..', 'public') }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    DBContract,
    DemoContract,
    JobsContract,
    OrgsContract,
    UsersContract,
    AppGateway,
  ],
})
export class AppModule implements NestModule {
  /**
   * for middleware use see https://docs.nestjs.com/v5/middleware
   * @param {MiddlewareConsumer} consumer;
   */
  configure(consumer: MiddlewareConsumer) {
    // consumer
    //   .apply(LoggerMiddleware)
    //   .forRoutes({ path: 'cats*', method: RequestMethod.GET }, { path: 'cats*', method: RequestMethod.POST });
  }
}

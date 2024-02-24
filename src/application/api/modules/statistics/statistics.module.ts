import {
  type MiddlewareConsumer,
  Module,
  type NestModule,
  RequestMethod,
  Scope,
} from '@nestjs/common';

import {Loggable} from '../../../../domain/common/ports/loggable.port';
import {LoggablePortFactory} from '../../../../infrastructure/factories/common/loggable-port.factory';
import {FetchTokenomics} from '../../../../domain/statistics/interactors/fetch-tokenomics.interactor';
import {FetchTokenomicsFactory} from '../../../../infrastructure/factories/statistics/fetch-tokenomics.factory';
import {StatisticsController} from './statistics.controller';
import cors from 'cors';

@Module({
  controllers: [StatisticsController],
  providers: [
    {
      provide: FetchTokenomics,
      useFactory: FetchTokenomicsFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: Loggable,
      useFactory: LoggablePortFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class StatisticsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        cors({
          origin: '*',
          methods: ['GET'],
        }),
      )
      .forRoutes({
        path: '/statistics/coinmarketcap',
        method: RequestMethod.GET,
      });
  }
}

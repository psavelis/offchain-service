import { Module, Scope } from '@nestjs/common';

import { Loggable } from '../../../../../../domain/common/ports/loggable.port';
import { LoggablePortFactory } from '../../../../../factories/common/loggable-port.factory';
import { FetchTokenomics } from '../../../../../../domain/statistics/interactors/fetch-tokenomics.interactor';
import { FetchTokenomicsFactory } from '../../../../../factories/statistics/fetch-tokenomics.factory';
import { StatisticsController } from './statistics.controller';

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
export class StatisticsModule {}

import { Module, Scope } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthcheckController } from './healthcheck.controller';

import { DatabaseHealthcheck } from 'src/domain/healthcheck/indicators/database-connection.indicator';
import { DatabaseHealthcheckFactory } from '../../../../../factories/healthcheck/database-healthcheck.factory';

@Module({
  controllers: [HealthcheckController],
  imports: [TerminusModule],
  providers: [
    {
      provide: DatabaseHealthcheck,
      useFactory: DatabaseHealthcheckFactory.getInstance,
      scope: Scope.DEFAULT,
    }
  ]
})
export class HealthcheckModule {}

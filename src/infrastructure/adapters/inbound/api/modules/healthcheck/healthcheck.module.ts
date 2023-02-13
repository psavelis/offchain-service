import { Module, Scope } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthcheckController } from './healthcheck.controller';

import { Loggable } from 'src/domain/common/ports/loggable.port';
import { DatabaseHealthcheck } from 'src/domain/healthcheck/usecases/database-connection.usecase';
import { DatabaseHealthcheckFactory } from '../../../../../factories/healthcheck/database-healthcheck.factory';
import { LoggablePortFactory } from '../../../../../factories/common/loggable-port.factory';

@Module({
  controllers: [HealthcheckController],
  imports: [TerminusModule],
  providers: [
    {
      provide: DatabaseHealthcheck,
      useFactory: DatabaseHealthcheckFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: Loggable,
      useFactory: LoggablePortFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class HealthcheckModule {}

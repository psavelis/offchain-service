import {Module, Scope} from '@nestjs/common';
import {TerminusModule} from '@nestjs/terminus';
import {HealthcheckController} from './health-check.controller';

import {HealthCheckInteractor} from '../../../../domain/health-check/interactors/health-check.interactor';
import {HealthCheckFactory} from '../../../../infrastructure/factories/health-check/health-check.factory';

@Module({
  controllers: [HealthcheckController],
  imports: [TerminusModule],
  providers: [
    {
      provide: HealthCheckInteractor,
      useFactory: HealthCheckFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class HealthcheckModule {}

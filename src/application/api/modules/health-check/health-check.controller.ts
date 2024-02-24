import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Throttle } from '@nestjs/throttler';

import { ApiTags } from '@nestjs/swagger';
import { HealthCheckInteractor } from '../../../../domain/health-check/interactors/health-check.interactor';

@ApiTags('health')
@Controller('/healthcheck')
export class HealthcheckController {
  constructor(
    @Inject(HealthCheckService)
    readonly terminusInstance: HealthCheckService,
    @Inject(HealthCheckInteractor)
    readonly healthCheckInteractor: HealthCheckInteractor,
  ) {}

  @Get()
  @Throttle(30, 60)
  async healthCheck() {
    await this.healthCheckInteractor.check(this.terminusInstance);

    return {
      status: 'ok',
    };
  }

  @HealthCheck()
  async healtheck() {
    return this.healthCheck().catch(() => ({ status: 'error' }));
  }
}

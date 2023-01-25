import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { DatabaseHealthcheck, DatabaseConnectionIndicator } from 'src/domain/healthcheck/indicators/database-connection.indicator';

@Controller('healthcheck')
export class HealthcheckController {
  constructor (
    private health: HealthCheckService,
    @Inject(DatabaseHealthcheck)
    readonly databaseIndicator: DatabaseConnectionIndicator,
  ) {}

  @Get()
  @HealthCheck()
  healthcheck() {
    return this.health.check([
      () => this.databaseIndicator.check(),
    ])
  }
}

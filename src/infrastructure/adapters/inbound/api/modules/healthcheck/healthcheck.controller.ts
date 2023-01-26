import { Controller, Get, Inject } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { Loggable, LoggablePort } from 'src/domain/common/ports/loggable.port';

import {
  DatabaseHealthcheck,
  DatabaseConnectionIndicator,
} from 'src/domain/healthcheck/indicators/database-connection.indicator';

@Controller('healthcheck')
export class HealthcheckController {
  constructor(
    private health: HealthCheckService,
    @Inject(DatabaseHealthcheck)
    readonly databaseIndicator: DatabaseConnectionIndicator,
    @Inject(Loggable)
    private logger: LoggablePort,
  ) {}

  @Get()
  @HealthCheck()
  async healthcheck() {
    const result = await this.health.check([
      () => this.databaseIndicator.check(),
    ]);

    if (result.status !== 'ok') {
      this.logger.warning('Healthcheck failed', result);
    }

    return result;
  }
}

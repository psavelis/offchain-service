import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { Loggable, LoggablePort } from 'src/domain/common/ports/loggable.port';

import {
  DatabaseHealthcheck,
  DatabaseConnectionUseCase,
} from 'src/domain/healthcheck/usecases/database-connection.usecase';

@Controller('healthcheck')
export class HealthcheckController {
  constructor(
    private health: HealthCheckService,
    @Inject(DatabaseHealthcheck)
    readonly databaseIndicator: DatabaseConnectionUseCase,
    @Inject(Loggable)
    private logger: LoggablePort,
  ) {}

  @Get()
  @HealthCheck()
  async healthcheck() {
    try {
      const result = await this.health.check([
        () => this.databaseIndicator.check(),
      ]);

      if (result.status !== 'ok') {
        this.logger.warning('Healthcheck failed', result);
      }

      return result;
    } catch (err) {
      this.logger.error(err, 'Healthcheck failed');

      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

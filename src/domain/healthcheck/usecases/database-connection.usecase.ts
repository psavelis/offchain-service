import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus'; // REVIEW: move to infrastructure layer
import { DatabaseConnectionPort } from '../ports/database-connection.port';

export const DatabaseHealthcheck = Symbol('DATABASE_HEALTHCHECK');

export class DatabaseConnectionUseCase extends HealthIndicator {
  constructor(private checker: DatabaseConnectionPort) {
    super();
  }

  async check(): Promise<HealthIndicatorResult> {
    try {
      const status = await this.checker.check();

      return this.getStatus('database', status, {});
    } catch (error) {
      throw new HealthCheckError('Connection failed', error?.message);
    }
  }
}

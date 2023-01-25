import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import { ConnectionChecker } from '../../../infrastructure/adapters/outbound/database/healthcheck/connection.checker';

export const DatabaseHealthcheck = Symbol('DATABASE_HEALTHCHECK');

export class DatabaseConnectionIndicator extends HealthIndicator {
    constructor (private checker: ConnectionChecker) {
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
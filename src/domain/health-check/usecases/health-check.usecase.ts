import { type LoggablePort } from 'src/domain/common/ports/loggable.port';
import { type HealthCheckInteractor } from '../interactors/health-check.interactor';
import { type HealthCheckPort } from '../ports/health-check.port';
import { type StorageHealthPort } from '../ports/storage-health.port';

export class HealthCheckUseCase implements HealthCheckInteractor {
  constructor(
    private readonly storage: StorageHealthPort,
    private readonly logger: LoggablePort,
  ) {}

  async check(healthCheck: HealthCheckPort): Promise<boolean> {
    try {
      const result = await healthCheck.check([
        async () => this.storage.check(),
      ]);

      if (result.status !== 'ok') {
        this.logger.warn('Unhealthy', result);
        return false;
      }

      return true;
    } catch (error) {
      this.logger.error(error, 'Failed to health check');

      throw error;
    }
  }
}

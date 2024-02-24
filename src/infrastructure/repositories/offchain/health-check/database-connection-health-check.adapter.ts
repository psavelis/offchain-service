import {type Knex} from 'knex';
import {type KnexPostgresDatabase} from '../knex-postgres.db';

import {type StorageHealthPort} from '../../../../domain/health-check/ports/storage-health.port';
import {HealthIndicator, type HealthIndicatorResult} from '@nestjs/terminus';

export class DatabaseConnectionHealthCheckAdapter
  extends HealthIndicator
  implements StorageHealthPort {
  static instance: DatabaseConnectionHealthCheckAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    super();
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): DatabaseConnectionHealthCheckAdapter {
    if (!DatabaseConnectionHealthCheckAdapter.instance) {
      DatabaseConnectionHealthCheckAdapter.instance =
        new DatabaseConnectionHealthCheckAdapter(knexPostgresDb);
    }

    return DatabaseConnectionHealthCheckAdapter.instance;
  }

  async check(): Promise<HealthIndicatorResult> {
    await this.db().raw('select true');

    return this.getStatus('database', true, {});
  }
}

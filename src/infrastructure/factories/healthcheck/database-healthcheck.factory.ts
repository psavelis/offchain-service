import { Settings } from '../../../domain/common/settings';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';

import { KnexPostgresDatabase } from '../../../infrastructure/adapters/outbound/database/knex-postgres.db';
import { DatabaseConnectionUseCase } from '../../../domain/healthcheck/usecases/database-connection.usecase';
import { DatabaseConnectionCheckerAdapter } from '../../adapters/outbound/database/healthcheck/database-connection-checker.adapter';

export class DatabaseHealthcheckFactory {
  static instance: DatabaseConnectionUseCase;

  static getInstance(): DatabaseConnectionUseCase {
    if (!this.instance) {
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const checker =
        DatabaseConnectionCheckerAdapter.getInstance(knexPostgresDb);

      this.instance = new DatabaseConnectionUseCase(checker);
    }

    return this.instance;
  }
}

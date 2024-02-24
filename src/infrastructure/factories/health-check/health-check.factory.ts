import {type Settings} from '../../../domain/common/settings';
import {SettingsAdapter} from '../../adapters/config/settings.adapter';

import {KnexPostgresDatabase} from '../../repositories/offchain/knex-postgres.db';
import {HealthCheckUseCase} from '../../../domain/health-check/usecases/health-check.usecase';
import {DatabaseConnectionHealthCheckAdapter} from '../../repositories/offchain/health-check/database-connection-health-check.adapter';
import Logger from '../../adapters/logging/logger';
import {type HealthCheckInteractor} from '../../../domain/health-check/interactors/health-check.interactor';

export class HealthCheckFactory {
  static instance: HealthCheckUseCase;
  static getInstance(): HealthCheckInteractor {
    if (!HealthCheckFactory.instance) {
      const settings: Settings = SettingsAdapter.getInstance().getSettings();
      const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
      const checker =
        DatabaseConnectionHealthCheckAdapter.getInstance(knexPostgresDb);
      const logger = Logger.getInstance();

      HealthCheckFactory.instance = new HealthCheckUseCase(checker, logger);
    }

    return HealthCheckFactory.instance;
  }
}


import { Settings } from '../../../domain/common/settings';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';

import { KnexPostgresDatabase } from '../../../infrastructure/adapters/outbound/database/knex-postgres.db';
import { DatabaseConnectionIndicator } from '../../../domain/healthcheck/indicators/database-connection.indicator';
import { ConnectionChecker } from '../../adapters/outbound/database/healthcheck/connection.checker';

export class DatabaseHealthcheckFactory {
    static instance: DatabaseConnectionIndicator;

    static getInstance(): DatabaseConnectionIndicator {
        if (!this.instance) {
            const settings: Settings = SettingsAdapter.getInstance().getSettings();
            const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
            const checker = ConnectionChecker.getInstance(knexPostgresDb);

            this.instance = new DatabaseConnectionIndicator(checker);
        }

        return this.instance;
    }
}
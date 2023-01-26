
import { Settings } from '../../../domain/common/settings';
import { SettingsAdapter } from '../../adapters/outbound/environment/settings.adapter';

import { KnexPostgresDatabase } from '../../../infrastructure/adapters/outbound/database/knex-postgres.db';
import { DatabaseConnectionIndicator } from '../../../domain/healthcheck/indicators/database-connection.indicator';
import { DatabaseConnectionCheckerAdapter } from '../../adapters/outbound/database/healthcheck/database-connection-checker.adapter';

export class DatabaseHealthcheckFactory {
    static instance: DatabaseConnectionIndicator;

    static getInstance(): DatabaseConnectionIndicator {
        if (!this.instance) {
            const settings: Settings = SettingsAdapter.getInstance().getSettings();
            const knexPostgresDb = KnexPostgresDatabase.getInstance(settings);
            const checker = DatabaseConnectionCheckerAdapter.getInstance(knexPostgresDb);

            this.instance = new DatabaseConnectionIndicator(checker);
        }

        return this.instance;
    }
}
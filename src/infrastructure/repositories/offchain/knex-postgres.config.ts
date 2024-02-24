import * as path from 'path';

import type {Knex} from 'knex';
import knexStringcase from 'knex-stringcase';
import {type Settings} from '../../../domain/common/settings';
import {SettingsAdapter} from '../../adapters/config/settings.adapter';

const getPostgresConfig = (settings: Settings) => {
  const {
    db: {database, host, password, port, schemaName, user},
  } = settings ?? SettingsAdapter.getInstance().getSettings();

  const configObj: Knex.Config = {
    client: 'pg',
    connection: {
      database,
      host,
      port,
      password,
      user,
    },
    pool: {min: 0, max: 30, acquireTimeoutMillis: 60 * 1000},
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      schemaName,
      tableName: 'migrations',
      loadExtensions: [path.extname(__filename)],
    },
    searchPath: [schemaName, 'public'],
  };

  return knexStringcase(configObj);
};

export default getPostgresConfig;

import * as path from 'path';

import type { Knex } from 'knex';
import knexStringcase from 'knex-stringcase';
import { Settings } from '../../../../domain/common/settings';
import { SettingsAdapter } from '../environment/settings.adapter';

const getPostgresConfig = (settings: Settings) => {
  const {
    db: { database, host, password, port, schemaName, user },
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
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      schemaName,
      tableName: 'migrations',
      loadExtensions: [
        path.extname(__filename)
      ]
    },
    searchPath: [schemaName, 'public'],
  };

  return knexStringcase(configObj);
};

export default getPostgresConfig;

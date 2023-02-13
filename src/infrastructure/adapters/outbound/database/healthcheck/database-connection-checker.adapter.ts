import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';

import { DatabaseConnectionPort } from '../../../../../domain/healthcheck/ports/database-connection.port';

export class DatabaseConnectionCheckerAdapter
  implements DatabaseConnectionPort
{
  static instance: DatabaseConnectionCheckerAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): DatabaseConnectionCheckerAdapter {
    if (!DatabaseConnectionCheckerAdapter.instance) {
      DatabaseConnectionCheckerAdapter.instance =
        new DatabaseConnectionCheckerAdapter(knexPostgresDb);
    }

    return DatabaseConnectionCheckerAdapter.instance;
  }

  async check(): Promise<boolean> {
    await this.db().raw('select true');

    return true;
  }
}

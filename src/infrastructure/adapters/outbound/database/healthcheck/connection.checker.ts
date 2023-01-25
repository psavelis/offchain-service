import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';

export class ConnectionChecker
{
  static instance: ConnectionChecker;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): ConnectionChecker {
    if (!ConnectionChecker.instance) {
      ConnectionChecker.instance = new ConnectionChecker(knexPostgresDb);
    }

    return ConnectionChecker.instance;
  }

  async check(): Promise<boolean> {
    await this.db().raw('select true');

    return true;
  }
}

import {type Settings} from '../../../domain/common/settings';
import getPostgresConfig from './knex-postgres.config';
import {knex, type Knex} from 'knex';

export class KnexPostgresDatabase {
  static instance: KnexPostgresDatabase;
  knexInstance: Knex;

  static getInstance(settings: Settings) {
    if (!KnexPostgresDatabase.instance) {
      KnexPostgresDatabase.instance = new KnexPostgresDatabase(settings);
    }

    return KnexPostgresDatabase.instance;
  }

  private constructor(readonly settings: Settings) {
    const knexPostgresConfig = getPostgresConfig(settings);

    this.knexInstance = knex(knexPostgresConfig);
  }

  public knex() {
    return this.knexInstance;
  }
}

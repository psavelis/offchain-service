import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { PersistableClearingPort } from '../../../../../domain/clearing/ports/persistable-clearing.port';
import {
  Clearing,
  ClearingProps,
} from '../../../../../domain/clearing/entities/clearing.entity';
import * as mapper from './clearing-entity.mapper';

const tableName = 'clearing';

export class PersistableClearingDbAdapter implements PersistableClearingPort {
  static instance: PersistableClearingDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableClearingPort {
    if (!PersistableClearingDbAdapter.instance) {
      PersistableClearingDbAdapter.instance = new PersistableClearingDbAdapter(
        knexPostgresDb,
      );
    }

    return PersistableClearingDbAdapter.instance;
  }

  async create(clearing: Clearing): Promise<Clearing> {
    const [record] = await this.db()
      .table(tableName)
      .insert(mapper.parseEntity(clearing))
      .returning('*');

    const clearingProps: ClearingProps = record,
      { id } = record;

    const created = new Clearing(clearingProps, id);

    return created;
  }

  async update(entity: Clearing): Promise<Clearing> {
    const newRecord = mapper.parseEntity(entity);

    const fields = Object.keys(newRecord)
      .filter((field) => field !== 'id')
      .map((field) => `${field} = :${field}`);

    await this.db().raw(
      `update clearing set ${fields.join(', ')} where id = :id`,
      newRecord,
    );

    const record = await this.db()
      .select('*')
      .from(tableName)
      .where({ id: entity.getId() })
      .first();

    return mapper.parseRow(record);
  }
}

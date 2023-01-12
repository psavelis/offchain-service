import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import {
  Clearing,
  ClearingProps,
  ClearingStatus,
} from '../../../../../domain/clearing/entities/clearing.entity';
import { FetchableClearingPort } from '../../../../../domain/clearing/ports/fetchable-clearing.port';

const tableName = 'clearing';
export class FetchableClearingDbAdapter implements FetchableClearingPort {
  static instance: FetchableClearingDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): FetchableClearingPort {
    if (!FetchableClearingDbAdapter.instance) {
      FetchableClearingDbAdapter.instance = new FetchableClearingDbAdapter(
        knexPostgresDb,
      );
    }

    return FetchableClearingDbAdapter.instance;
  }

  async fetchLast(): Promise<Clearing | undefined> {
    const record = await this.db()
      .select([
        'id',
        'hash',
        'target',
        'offset',
        'status',
        'created_at',
        'ended_at',
        'duration_ms',
        'total_entries',
        'total_amount',
        'remarks',
      ])
      .from(tableName)
      .where({ status: ClearingStatus.RanToCompletion })
      .orderBy('created_at', 'desc')
      .first();

    if (!record?.id) {
      return;
    }

    const clearingProps: ClearingProps = record,
      { id } = record;

    return new Clearing(clearingProps, id);
  }
}

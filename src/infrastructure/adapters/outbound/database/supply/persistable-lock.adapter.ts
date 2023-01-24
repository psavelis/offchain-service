import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { PersistableLockPort } from '../../../../../domain/supply/ports/persistable-lock.port';
import {
  LockEntity,
  LockProps,
} from '../../../../../domain/supply/entities/lock.entity';

import * as mapper from './lock-entity.mapper';

const tableName = 'lock';
export class PersistableLockDbAdapter implements PersistableLockPort {
  static instance: PersistableLockDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableLockPort {
    if (!PersistableLockDbAdapter.instance) {
      PersistableLockDbAdapter.instance = new PersistableLockDbAdapter(
        knexPostgresDb,
      );
    }

    return PersistableLockDbAdapter.instance;
  }

  async create(lock: LockEntity): Promise<LockEntity> {
    const [record] = await this.db()
      .table(tableName)
      .insert(mapper.parseEntity(lock))
      .returning('*');

    const lockProps: LockProps = record,
      { id } = record;

    const created = new LockEntity(lockProps, id);

    return created;
  }

  async update(lock: LockEntity): Promise<void> {
    const param = {
      lockId: lock.getId(),
      updatedAt: new Date(),
      transactionHash: lock.getTransactionHash(),
    };

    await this.db().raw(
      `update "lock" set updated_at = :updatedAt, transaction_hash = :transactionHash where id = :lockId;`,
      param,
    );
  }
}

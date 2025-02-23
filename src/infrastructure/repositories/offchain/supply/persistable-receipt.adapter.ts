import {type Knex} from 'knex';
import {type KnexPostgresDatabase} from '../knex-postgres.db';
import {type PersistableReceiptPort} from '../../../../domain/supply/ports/persistable-receipt.port';
import {
  Receipt,
  type ReceiptProps,
} from '../../../../domain/supply/entities/receipt.entity';

import * as mapper from './receipt-entity.mapper';

const tableName = 'receipt';
export class PersistableReceiptDbAdapter implements PersistableReceiptPort {
  static instance: PersistableReceiptDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableReceiptPort {
    if (!PersistableReceiptDbAdapter.instance) {
      PersistableReceiptDbAdapter.instance = new PersistableReceiptDbAdapter(
        knexPostgresDb,
      );
    }

    return PersistableReceiptDbAdapter.instance;
  }

  async create(receipt: Receipt): Promise<Receipt> {
    const [record] = await this.db()
      .table(tableName)
      .insert(mapper.parseEntity(receipt))
      .returning('*');

    const receiptProps: ReceiptProps = record;

    const created = new Receipt(receiptProps);

    return created;
  }
}

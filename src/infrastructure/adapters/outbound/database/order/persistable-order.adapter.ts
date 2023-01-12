import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { PersistableOrderPort } from '../../../../../domain/order/ports/persistable-order.port';
import {
  Order,
  OrderProps,
} from '../../../../../domain/order/entities/order.entity';
import * as mapper from './order-entity.mapper';

const tableName = 'order';
export class PersistableOrderDbAdapter implements PersistableOrderPort {
  static instance: PersistableOrderDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableOrderPort {
    if (!PersistableOrderDbAdapter.instance) {
      PersistableOrderDbAdapter.instance = new PersistableOrderDbAdapter(
        knexPostgresDb,
      );
    }

    return PersistableOrderDbAdapter.instance;
  }

  async create(order: Order): Promise<Order> {
    const [record] = await this.db()
      .table(tableName)
      .insert(mapper.parseEntity(order))
      .returning('*');

    const orderProps: OrderProps = record,
      { id } = record;

    const created = new Order(orderProps, id);

    return created;
  }
}

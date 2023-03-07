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

  async refresh(order: Order): Promise<void> {
    const param = {
      orderId: order.getId(),
      total: order.getTotal(),
      amountOftokens: order.getAmountOfTokens(),
      totalGas: order.getTotalGas(),
      totalNet: order.getTotalNet(),
      totalKnn: order.getTotalKnn(),
    };

    await this.db().raw(
      `update "order" as o set total = :total, amount_of_tokens = :amountOftokens, total_gas = :totalGas, total_net = :totalGas, total_knn = :totalKnn where o.id = :orderId;`,
      param,
    );
  }
}

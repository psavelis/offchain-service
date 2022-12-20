import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { PersistableOrderPort } from '../../../../../domain/order/ports/persistable-order.port';
import { Order } from '../../../../../domain/order/entities/order.entity';

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

  async save(order: Order): Promise<Order> {
    const {
      id,
      endToEndId,
      isoCode,
      paymentOption,
      total,
      userIdentifier,
      identifierType,
    } = order;

    await this.db().table('order').insert({
      id,
      end_to_end_id: endToEndId,
      iso_code: isoCode,
      payment_option: paymentOption,
      user_identifier: userIdentifier,
      identifier_type: identifierType,
      total,
    });

    return order;
  }
}

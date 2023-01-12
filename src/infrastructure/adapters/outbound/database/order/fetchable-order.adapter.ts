import { Knex } from 'knex';
import { EndToEndId } from '../../../../../domain/order/dtos/order-dictionary.dto';
import {
  Order,
  OrderProps,
} from '../../../../../domain/order/entities/order.entity';
import { FetchableOrderPort } from '../../../../../domain/order/ports/fetchable-order.port';
import { KnexPostgresDatabase } from '../knex-postgres.db';

const tableName = 'order';
export class FetchableOrderDbAdapter implements FetchableOrderPort {
  static instance: FetchableOrderDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(knexPostgresDb: KnexPostgresDatabase): FetchableOrderPort {
    if (!FetchableOrderDbAdapter.instance) {
      FetchableOrderDbAdapter.instance = new FetchableOrderDbAdapter(
        knexPostgresDb,
      );
    }

    return FetchableOrderDbAdapter.instance;
  }

  async fetchByEndId(endToEndId: string): Promise<Order | undefined> {
    const record = await this.db()
      .select([
        'id',
        'parent_id as parentId',
        'payment_option as paymentOption',
        'iso_code as isoCode',
        'end_to_end_id as endToEndId',
        'total',
        'amount_of_tokens as amountOfTokens',
        'user_identifier as userIdentifier',
        'identifier_type as identifierType',
        'client_ip as clientIp',
        'client_agent as clientAgent',
        'status',
        'created_at as createdAt',
        'expires_at as expiresAt',
      ])
      .from(tableName)
      .where({ ['end_to_end_id']: endToEndId })
      .first();

    console.log('record =>', record);

    if (!record?.id) {
      return;
    }

    const orderProps: OrderProps = record,
      { id } = record;

    const payments = (
      await this.db()
        .select(['id'])
        .from('payment')
        .where({ ['order_id']: id })
    )?.length;

    const order = new Order(orderProps, id);

    if (payments) {
      order.setPayments(payments);
    }

    return order;
  }

  async fetchManyByEndId(
    endToEndIds: EndToEndId[],
  ): Promise<Record<EndToEndId, Order>> {
    const result: Record<EndToEndId, Order> = {};

    const records = await this.db()
      .select([
        'id',
        'parent_id as parentId',
        'payment_option as paymentOption',
        'iso_code as isoCode',
        'end_to_end_id as endToEndId',
        'total',
        'amount_of_tokens as amountOfTokens',
        'user_identifier as userIdentifier',
        'identifier_type as identifierType',
        'client_ip as clientIp',
        'client_agent as clientAgent',
        'status',
        'created_at as createdAt',
        'expires_at as expiresAt',
      ])
      .from(tableName)
      .whereIn('end_to_end_id', endToEndIds);

    if (!records?.length) {
      return result;
    }

    for (const rawOrder of records) {
      const orderProps: OrderProps = rawOrder,
        { id, endToEndId } = rawOrder;

      // TODO: opt3: da pra retirar essa query e colocar no join /\
      const payments = (
        await this.db()
          .select(['id'])
          .from('payment')
          .where({ ['order_id']: id })
      )?.length;

      const order = new Order(orderProps, id);

      if (payments) {
        order.setPayments(payments);
      }

      result[endToEndId] = order;
    }

    return result;
  }
}

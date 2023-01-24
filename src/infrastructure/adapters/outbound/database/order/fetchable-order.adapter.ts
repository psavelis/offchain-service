import { Knex } from 'knex';
import { OrderWithPayment } from 'src/domain/order/dtos/order-with-payment.dto';
import { EndToEndId } from '../../../../../domain/order/dtos/order-dictionary.dto';
import {
  Order,
  OrderProps,
  OrderStatus,
} from '../../../../../domain/order/entities/order.entity';
import { FetchableOrderPort } from '../../../../../domain/order/ports/fetchable-order.port';
import { KnexPostgresDatabase } from '../knex-postgres.db';

const tableName = 'order';
export class FetchableOrderDbAdapter implements FetchableOrderPort {
  static instance: FetchableOrderDbAdapter;
  private db: () => Knex<any, any[]>;

  private readonly orderTableFields = [
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
  ];

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
    // TODO: cachear finalizadas (status claim+)
    const record = await this.db()
      .select(this.orderTableFields)
      .from(tableName)
      .where({ ['end_to_end_id']: endToEndId })
      .first();

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
      order.setPaymentCount(payments);
    }

    return order;
  }

  async fetchManyByEndId(
    endToEndIds: EndToEndId[],
  ): Promise<Record<EndToEndId, Order>> {
    const result: Record<EndToEndId, Order> = {};

    const records = await this.db()
      .select(this.orderTableFields)
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
        order.setPaymentCount(payments);
      }

      result[endToEndId] = order;
    }

    return result;
  }

  async fetchPendingSettlement(
    limit: number = 50,
  ): Promise<Record<number, OrderWithPayment>> {
    const fields = [
      ...this.orderTableFields.map((field) => `"order".${field}`),
      'payment.id as paymentId',
      'payment.sequence as paymentSequence',
      'payment.order_id as paymentOrderId',
    ];

    const records = await this.db()
      .select(fields)
      .from(tableName)
      .leftJoin('"lock"', '"lock".order_id', '=', '"order".id')
      .leftJoin('"claim"', '"claim".order_id', '=', '"order".id')
      .leftJoin('"receipt"', '"receipt".order_id', '=', '"receipt".id')
      .innerJoin('payment', 'payment.order_id', '=', '"order".id')
      .innerJoin('clearing', 'clearing.id', '=', 'payment.clearing_id')
      .where('"order".status', OrderStatus.Confirmed)
      .and.whereNull('"lock".id')
      .and.whereNull('"claim".id')
      .and.whereNull('"receipt".id')
      .and.whereNotNull('payment.id')
      .limit(limit);

    if (!records?.length) {
      return [];
    }

    const result: Record<number, OrderWithPayment> = {};

    for (const rawOrder of records) {
      const orderProps: OrderProps = rawOrder,
        { id, paymentId, paymentSequence, paymentOrderId } = rawOrder;

      const order = new Order(orderProps, id);

      if (paymentId && Number(paymentSequence) > 0) {
        result[paymentSequence] = {
          order,
          payment: {
            id: paymentId,
            orderId: paymentOrderId,
            sequence: paymentSequence,
          },
        };
      }
    }

    return result;
  }
}

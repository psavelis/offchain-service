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
    const query = `select "order"."id",
      "order"."parent_id" as "parentId",
      "order"."payment_option" as "paymentOption",
      "order"."iso_code" as "isoCode", 
      "order"."end_to_end_id" as "endToEndId",
      "order"."total",
      "order"."amount_of_tokens" as "amountOfTokens",
      "order"."user_identifier" as "userIdentifier",
      "order"."identifier_type" as "identifierType",
      "order"."client_ip" as "clientIp",
      "order"."client_agent" as "clientAgent",
      "order"."status",
      "order"."created_at" as "createdAt",
      "order"."expires_at" as "expiresAt",
      "lock"."transaction_hash" as "lockTransactionHash",
      "claim"."transaction_hash" as "claimTransactionHash",
      "payment"."sequence" as "paymentSequence" 
      "payment"."provider_id" as "paymentProviderId" 
      from "order" 
      left join "lock" on "lock"."order_id" = "order"."id" 
      left join "claim" on "claim"."order_id" = "order"."id"
      left join "payment" on "payment"."order_id" = "order"."id" 
      where "order".end_to_end_id = :endToEndId limit 1`;

    const param = { endToEndId: endToEndId };

    const { rows: records } = await this.db().raw(query, param);

    if (!records?.length) {
      return undefined;
    }

    const [orderProps]: OrderProps[] = records,
      [{ id, lockTransactionHash, paymentSequence, paymentProviderId, claimTransactionHash }] =
        records;

    const order = new Order(orderProps, id);

    if (paymentSequence) {
      order.setPaymentSquence(paymentSequence);
      order.setPaymentCount(1);
    }

    if (paymentProviderId) {
      order.setPaymentProviderId(paymentProviderId);
    }

    if (lockTransactionHash) {
      order.setLockTransactionHash(lockTransactionHash);
    }

    if (claimTransactionHash) {
      order.setClaimTransactionHash(claimTransactionHash);
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
    const query = `select "order"."id",
      "order"."parent_id" as "parentId",
      "order"."payment_option" as "paymentOption",
      "order"."iso_code" as "isoCode", 
      "order"."end_to_end_id" as "endToEndId",
      "order"."total",
      "order"."amount_of_tokens" as "amountOfTokens",
      "order"."user_identifier" as "userIdentifier",
      "order"."identifier_type" as "identifierType",
      "order"."client_ip" as "clientIp",
      "order"."client_agent" as "clientAgent",
      "order"."status",
      "order"."created_at" as "createdAt",
      "order"."expires_at" as "expiresAt",
      "payment"."id" as "paymentId",
      "payment"."sequence" as "paymentSequence",
      "payment"."order_id" as "paymentOrderId" 
      from "order" 
      left join "lock" on "lock"."order_id" = "order"."id" 
      left join "claim" on "claim"."order_id" = "order"."id" 
      inner join "payment" on "payment"."order_id" = "order"."id" 
      inner join "clearing" on "clearing"."id" = "payment"."clearing_id" 
      left join "receipt" on "receipt"."order_id" = "order"."id"
      where "order"."status" = :status and "lock"."id" is null 
      and "claim"."id" is null and "receipt"."id" is null and "payment"."id" is not null limit :limit`;

    const param = {
      status: OrderStatus.Confirmed,
      limit,
    };

    const { rows: records } = await this.db().raw(query, param);

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

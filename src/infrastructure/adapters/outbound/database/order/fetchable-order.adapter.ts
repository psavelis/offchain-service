import { Knex } from 'knex';
import { OrderWithPayment } from '../../../../../domain/order/dtos/order-with-payment.dto';
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
      'order.total_gas as totalGas',
      'order.total_knn as totalKnn',
      'order.total_net as totalNet',
      "order"."amount_of_tokens" as "amountOfTokens",
      "order"."user_identifier" as "userIdentifier",
      "order"."identifier_type" as "identifierType",
      "order"."client_ip" as "clientIp",
      "order"."client_agent" as "clientAgent",
      "order"."status",
      "order"."created_at" as "createdAt",
      "order"."expires_at" as "expiresAt",
      "lock"."transaction_hash" as "lockTransactionHash",
      "lock"."uint256_amount" as "totalLockedUint256",
      "claim"."transaction_hash" as "claimTransactionHash",
      coalesce("lock_receipt"."to", "claim_receipt"."to") as "contractAddress",
      coalesce("lock_receipt"."chain_id", "claim_receipt"."chain_id") as "chainId",
      "payment"."sequence" as "paymentSequence",
      "payment"."provider_id" as "paymentProviderId"
      from "order"
      left join "lock" on "lock"."order_id" = "order"."id"
      left join "receipt" as "lock_receipt" on "lock_receipt"."transaction_hash" = "lock"."transaction_hash"
      left join "claim" on "claim"."order_id" = "order"."id"
      left join "receipt" as "claim_receipt" on "claim_receipt"."transaction_hash" = "claim"."transaction_hash"
      left join "payment" on "payment"."order_id" = "order"."id"
      where "order".end_to_end_id = :endToEndId limit 1`;

    const param = { endToEndId: endToEndId };

    const { rows: records } = await this.db().raw(query, param);

    if (!records?.length) {
      return undefined;
    }

    const [orderProps]: OrderProps[] = records,
      [
        {
          id,
          lockTransactionHash,
          paymentSequence,
          paymentProviderId,
          claimTransactionHash,
          totalLockedUint256,
          contractAddress,
          chainId,
        },
      ] = records;

    const order = new Order(orderProps, id);

    if (paymentSequence) {
      order.setPaymentSequence(paymentSequence);
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

    if (totalLockedUint256) {
      order.setTotalLockedUint256(totalLockedUint256);
    }

    if (contractAddress) {
      order.setContractAddress(contractAddress);
    }

    if (chainId) {
      order.setChainId(chainId);
    }

    return order;
  }

  async fetchManyByEndId(
    endToEndIds: EndToEndId[],
  ): Promise<Record<EndToEndId, Order>> {
    const result: Record<EndToEndId, Order> = {};

    const records = await this.db()
      .select([
        'order.id',
        'order.parent_id as parentId',
        'order.payment_option as paymentOption',
        'order.iso_code as isoCode',
        'order.end_to_end_id as endToEndId',
        'order.total',
        'order.total_gas as totalGas',
        'order.total_knn as totalKnn',
        'order.total_net as totalNet',
        'order.amount_of_tokens as amountOfTokens',
        'order.user_identifier as userIdentifier',
        'order.identifier_type as identifierType',
        'order.client_ip as clientIp',
        'order.client_agent as clientAgent',
        'order.status',
        'order.created_at as createdAt',
        'order.expires_at as expiresAt',
        'lock.transaction_hash as lockTransactionHash',
        'lock.uint256_amount as totalLockedUint256',
        'claim.transaction_hash as claimTransactionHash',
        this.db().raw(
          'coalesce("lock_receipt"."to", "claim_receipt"."to") as "contractAddress"',
        ),
        this.db().raw(
          'coalesce("lock_receipt"."chain_id", "claim_receipt"."chain_id") as "chainId"',
        ),
        'payment.sequence as paymentSequence',
        'payment.provider_id as paymentProviderId',
      ])
      .from(tableName)
      .leftJoin('payment', 'order.id', 'payment.order_id')
      .leftJoin('lock', 'order.id', 'lock.order_id')
      .leftJoin(
        'receipt as lock_receipt',
        'lock.transaction_hash',
        'lock_receipt.transaction_hash',
      )
      .leftJoin('claim', 'order.id', 'claim.order_id')
      .leftJoin(
        'receipt as claim_receipt',
        'claim.transaction_hash',
        'claim_receipt.transaction_hash',
      )
      .whereIn(`order.end_to_end_id`, endToEndIds);

    if (!records?.length) {
      return result;
    }

    for (const rawOrder of records) {
      const orderProps: OrderProps = rawOrder;
      const {
        id,
        paymentSequence,
        paymentProviderId,
        lockTransactionHash,
        claimTransactionHash,
        totalLockedUint256,
        contractAddress,
        chainId,
      } = rawOrder;

      const order = new Order(orderProps, id);

      if (paymentSequence) {
        order.setPaymentSequence(paymentSequence);
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

      if (totalLockedUint256) {
        order.setTotalLockedUint256(totalLockedUint256);
      }

      if (contractAddress) {
        order.setContractAddress(contractAddress);
      }

      if (chainId) {
        order.setChainId(chainId);
      }

      result[orderProps.endToEndId] = order;
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
      'order.total_gas as totalGas',
      'order.total_knn as totalKnn',
      'order.total_net as totalNet',
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
      "payment"."provider_id" as "paymentProviderId"
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
      const orderProps: OrderProps = rawOrder;
      const { id, paymentId, paymentSequence, paymentProviderId } = rawOrder;

      const order = new Order(orderProps, id);

      if (paymentSequence) {
        order.setPaymentSequence(paymentSequence);
        order.setPaymentCount(1);
      }

      if (paymentProviderId) {
        order.setPaymentProviderId(paymentProviderId);
      }

      if (paymentId && Number(paymentSequence) > 0) {
        result[paymentSequence] = {
          order,
          payment: {
            id: paymentId,
            orderId: id,
            sequence: paymentSequence,
          },
        };
      }
    }

    return result;
  }

  async fetchLockedAndNotClaimedInStatus(
    ...orderStatus: OrderStatus[]
  ): Promise<Record<string, Order>> {
    const orders: Record<string, Order> = {};

    const records = await this.db()
      .select([
        'order.id',
        'order.parent_id as parentId',
        'order.payment_option as paymentOption',
        'order.iso_code as isoCode',
        'order.end_to_end_id as endToEndId',
        'order.total',
        'order.total_gas as totalGas',
        'order.total_knn as totalKnn',
        'order.total_net as totalNet',
        'order.amount_of_tokens as amountOfTokens',
        'order.user_identifier as userIdentifier',
        'order.identifier_type as identifierType',
        'order.client_ip as clientIp',
        'order.client_agent as clientAgent',
        'order.status',
        'order.created_at as createdAt',
        'order.expires_at as expiresAt',
        'lock.transaction_hash as lockTransactionHash',
        'lock.uint256_amount as totalLockedUint256',
        'claim.transaction_hash as claimTransactionHash',
        'claim.id as claimId',
        this.db().raw(
          'coalesce("lock_receipt"."to", "claim_receipt"."to") as "contractAddress"',
        ),
        this.db().raw(
          'coalesce("lock_receipt"."chain_id", "claim_receipt"."chain_id") as "chainId"',
        ),
        'payment.sequence as paymentSequence',
        'payment.provider_id as paymentProviderId',
      ])
      .from(tableName)
      .innerJoin('payment', 'order.id', 'payment.order_id')
      .innerJoin('lock', 'order.id', 'lock.order_id')
      .innerJoin(
        'receipt as lock_receipt',
        'lock.transaction_hash',
        'lock_receipt.transaction_hash',
      )
      .leftJoin('claim', 'order.id', 'claim.order_id')
      .leftJoin(
        'receipt as claim_receipt',
        'claim.transaction_hash',
        'claim_receipt.transaction_hash',
      )
      .whereIn('order.status', orderStatus)
      .andWhere((qb) => qb.whereNull('claim.id'));

    if (!records?.length) {
      return orders;
    }

    for (const rawOrder of records) {
      const orderProps: OrderProps = rawOrder;
      const {
        id,
        paymentSequence,
        paymentProviderId,
        lockTransactionHash,
        claimTransactionHash,
        totalLockedUint256,
        contractAddress,
        chainId,
      } = rawOrder;

      const order = new Order(orderProps, id);

      if (paymentSequence) {
        order.setPaymentSequence(paymentSequence);
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

      if (totalLockedUint256) {
        order.setTotalLockedUint256(totalLockedUint256);
      }

      if (contractAddress) {
        order.setContractAddress(contractAddress);
      }

      if (chainId) {
        order.setChainId(chainId);
      }

      orders[id] = order;
    }

    return orders;
  }
}

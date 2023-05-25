import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { Order } from '../../../../../domain/order/entities/order.entity';
import { PersistableClaimReceiptPort } from '../../../../../domain/transaction/ports/persistable-claim-receipt.port';
import { OnChainUserReceipt } from '../../../../../domain/supply/dtos/onchain-user-receipt.dto';
import { Id } from '../../../../../domain/common/uuid';

export class PersistableClaimReceiptDbAdapter
  implements PersistableClaimReceiptPort
{
  static instance: PersistableClaimReceiptDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableClaimReceiptPort {
    if (!PersistableClaimReceiptDbAdapter.instance) {
      PersistableClaimReceiptDbAdapter.instance =
        new PersistableClaimReceiptDbAdapter(knexPostgresDb);
    }

    return PersistableClaimReceiptDbAdapter.instance;
  }

  async create(order: Order, userReceipt: OnChainUserReceipt): Promise<void> {
    const userReceiptParam = {
      chainId: userReceipt.chainId,
      blockNumber: userReceipt.blockNumber,
      transactionHash: userReceipt.transactionHash,
      orderId: order.getId(),
      from: userReceipt.from,
      to: userReceipt.to,
      gasUsed: userReceipt.gasUsed,
      cumulativeGasUsed: userReceipt.cumulativeGasUsed,
      effectiveGasPrice: userReceipt.effectiveGasPrice,
      amountInKnn: userReceipt.amountInKnn,
      userIdentifier: userReceipt.cryptoWallet,
      paymentSequence: order.getPaymentSequence(),
      createdAt: userReceipt.pastDue,
    };

    const claimParam = {
      id: Id.createUnique(),
      paymentSequence: order.getPaymentSequence(),
      onchainAddress: userReceipt.cryptoWallet,
      orderId: order.getId(),
      uint256Amount: userReceipt.uint256Amount,
      userTransactionHash: userReceipt.transactionHash,
      createdAt: userReceipt.pastDue,
      updatedAt: userReceipt.pastDue,
    };

    await this.db().raw(
      `insert into "user_receipt" (chain_id, block_number, transaction_hash, order_id, "from", "to", gas_used, cumulative_gas_used, effective_gas_price, amount_in_knn, user_identifier, payment_id, created_at) values (:chainId, :blockNumber, :transactionHash, :orderId, :from, :to, :gasUsed, :cumulativeGasUsed, :effectiveGasPrice, :amountInKnn, :userIdentifier, (select id from "payment" as p where p.sequence = :paymentSequence), :createdAt);`,
      userReceiptParam,
    );

    await this.db().raw(
      `insert into "claim" (id, payment_id, onchain_address, order_id, uint256_amount, created_at, user_transaction_hash, updated_at) values (:id, (select id from "payment" as p where p.sequence = :paymentSequence), :onchainAddress, :orderId, :uint256Amount, :createdAt, :userTransactionHash, :updatedAt)`,
      claimParam,
    );
  }
}

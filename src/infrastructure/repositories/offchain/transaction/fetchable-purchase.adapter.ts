import {type Knex} from 'knex';
import {type KnexPostgresDatabase} from '../knex-postgres.db';
import {type FetchablePurchasePort} from '../../../../domain/transaction/ports/fetchable-purchase.port';

import {
  Purchase,
  type PurchaseProps,
} from '../../../../domain/transaction/entities/purchase.entity';

export class FetchablePurchaseDbAdapter implements FetchablePurchasePort {
  static instance: FetchablePurchaseDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): FetchablePurchasePort {
    if (!FetchablePurchaseDbAdapter.instance) {
      FetchablePurchaseDbAdapter.instance = new FetchablePurchaseDbAdapter(
        knexPostgresDb,
      );
    }

    return FetchablePurchaseDbAdapter.instance;
  }

  async fetchByTransactionHash(
    transactionHash: string,
  ): Promise<Purchase | undefined> {
    const query = `select 
      p.id as id,
      p.payment_date as paymentDate,
      p.total_knn as totalKnn,
      p.knn_price_in_usd as knnPriceInUsd,
      p.total_usd as totalUsd,
      p.total_gas_usd as totalGasUsd,
      p.contract_address as contractAddress,
      p.network as network,
      p.crypto_wallet as cryptoWallet,
      p.purchase_transaction_hash as purchaseTransactionHash,
      p.total_eth as totalEth,
      p.total_gas_eth as totalGasEth,
      p.eth_price_in_usd as ethPriceInUsd,
      p.ethereum_block_number as ethereumBlockNumber,
      p.total_matic as totalMatic,
      p.total_gas_matic as totalGasMatic,
      p.matic_price_in_usd as maticPriceInUsd,
      p.polygon_block_number as polygonBlockNumber,
      p.created_at as createdAt
    from purchase p where p.purchase_transaction_hash = :transactionHash`;

    const param = {transactionHash};

    const {rows: records} = await this.db().raw(query, param);

    if (!records?.length) {
      return undefined;
    }

    const [purchaseProps]: PurchaseProps[] = records,
      [{id}] = records;

    const purchase = new Purchase(purchaseProps, id);

    return purchase;
  }

  async fetchLastBlocks(): Promise<{
		ethereumLastBlock: number;
		polygonLastBlock: number;
	}> {
    const query = `select 
        coalesce(max(p.ethereum_block_number), 0) + 1 as ethereumLastBlock, 
        coalesce(max(p.polygon_block_number), 0) + 1 as polygonLastBlock
      from purchase p `;

    const {rows: records} = await this.db().raw(query);

    if (!records?.length) {
      return {ethereumLastBlock: 0, polygonLastBlock: 0};
    }

    const [
      {
        ethereumlastblock: ethereumLastBlock,
        polygonlastblock: polygonLastBlock,
      },
    ] = records;

    return {
      ethereumLastBlock,
      polygonLastBlock,
    };
  }
}

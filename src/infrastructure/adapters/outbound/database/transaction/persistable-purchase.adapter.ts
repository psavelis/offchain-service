import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { PersistablePurchasePort } from '../../../../../domain/transaction/ports/persistable-purchase.port';
import { Purchase } from '../../../../../domain/transaction/entities/purchase.entity';

export class PersistablePurchaseDbAdapter implements PersistablePurchasePort {
  static instance: PersistablePurchaseDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistablePurchasePort {
    if (!PersistablePurchaseDbAdapter.instance) {
      PersistablePurchaseDbAdapter.instance = new PersistablePurchaseDbAdapter(
        knexPostgresDb,
      );
    }

    return PersistablePurchaseDbAdapter.instance;
  }

  async create({
    paymentDate,
    totalKnn,
    knnPriceInUsd,
    totalUsd,
    totalGasUsd,
    contractAddress,
    network,
    cryptoWallet,
    purchaseTransactionHash,
    totalEth,
    totalGasEth,
    ethPriceInUsd,
    ethereumBlockNumber,
    totalMatic,
    totalGasMatic,
    maticPriceInUsd,
    polygonBlockNumber,
  }: Purchase): Promise<void> {
    const param = {
      paymentDate,
      totalKnn,
      knnPriceInUsd,
      totalUsd,
      totalGasUsd,
      contractAddress,
      network,
      cryptoWallet,
      purchaseTransactionHash,

      totalEth: totalEth ?? 0,
      totalGasEth: totalGasEth ?? 0,
      ethPriceInUsd: ethPriceInUsd ?? 0,
      ethereumBlockNumber: ethereumBlockNumber ?? 0,

      totalMatic: totalMatic ?? 0,
      totalGasMatic: totalGasMatic ?? 0,
      maticPriceInUsd: maticPriceInUsd ?? 0,
      polygonBlockNumber: polygonBlockNumber ?? 0,
    };

    await this.db().raw(
      'insert into purchase (payment_date, total_knn, knn_price_in_usd, total_usd, total_gas_usd, contract_address, network, crypto_wallet, purchase_transaction_hash, total_eth, total_gas_eth, eth_price_in_usd, ethereum_block_number, total_matic, total_gas_matic, matic_price_in_usd, polygon_block_number) values (:paymentDate, :totalKnn, :knnPriceInUsd, :totalUsd, :totalGasUsd, :contractAddress, :network, :cryptoWallet, :purchaseTransactionHash, :totalEth, :totalGasEth, :ethPriceInUsd, :ethereumBlockNumber, :totalMatic, :totalGasMatic, :maticPriceInUsd, :polygonBlockNumber);',
      param,
    );
  }
}

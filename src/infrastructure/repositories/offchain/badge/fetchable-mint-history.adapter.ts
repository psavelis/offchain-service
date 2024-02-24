import {type Knex} from 'knex';
import {type KnexPostgresDatabase} from '../knex-postgres.db';
import {type FetchableMintHistoryPort} from '../../../../domain/badge/ports/fetchable-mint-history.port';
import {
  MintHistory,
  type MintHistoryProps,
} from '../../../../domain/badge/entities/mint-history.entity';

const tableName = 'mint_history';
export class FetchableMintHistoryDbAdapter implements FetchableMintHistoryPort {
  static instance: FetchableMintHistoryDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): FetchableMintHistoryPort {
    if (!FetchableMintHistoryDbAdapter.instance) {
      FetchableMintHistoryDbAdapter.instance =
        new FetchableMintHistoryDbAdapter(knexPostgresDb);
    }

    return FetchableMintHistoryDbAdapter.instance;
  }

  async fetchLast(
    cryptoWallet: string,
    referenceMetadataId: number,
  ): Promise<MintHistory | undefined> {
    const records = await this.db()
      .select([
        'id',
        'chain_id as chainId',
        'due_date as dueDate',
        'amount',
        'reference_metadata_id as referenceMetadataId',
        'crypto_wallet as cryptoWallet',
        'valid',
        'description',
        'client_ip as clientIp',
        'client_agent as clientAgent',
        'created_at as createdAt',
      ])
      .from(tableName)
      .where('crypto_wallet', cryptoWallet)
      .andWhere('reference_metadata_id', referenceMetadataId)
      .whereNotNull('due_date')
      .orderBy('due_date', 'desc')
      .limit(1);

    if (!records?.length) {
      return undefined;
    }

    const [rawMintHistory] = records;

    const mintHistoryProps: MintHistoryProps = rawMintHistory;

    const {id} = rawMintHistory;

    const mintHistory = new MintHistory(mintHistoryProps, id);

    return mintHistory;
  }
}

import { type Knex } from 'knex';
import { type MintHistory } from '../../../../domain/badge/entities/mint-history.entity';
import { type PersistableMintHistoryPort } from '../../../../domain/badge/ports/persistable-mint-history.port';
import { type KnexPostgresDatabase } from '../knex-postgres.db';

const tableName = 'mint_history';
export class PersistableMintHistoryDbAdapter
  implements PersistableMintHistoryPort
{
  static instance: PersistableMintHistoryDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableMintHistoryPort {
    if (!PersistableMintHistoryDbAdapter.instance) {
      PersistableMintHistoryDbAdapter.instance =
        new PersistableMintHistoryDbAdapter(knexPostgresDb);
    }

    return PersistableMintHistoryDbAdapter.instance;
  }

  async create(mintHistory: MintHistory): Promise<void> {
    const param = {
      amount: mintHistory.amount,
      reference_metadata_id: mintHistory.referenceMetadataId,
      crypto_wallet: mintHistory.cryptoWallet,
      valid: mintHistory.valid,
      description: mintHistory.description,
      client_ip: mintHistory.clientIp,
      client_agent: mintHistory.clientAgent,
      due_date: mintHistory.dueDate,
      chain_id: mintHistory.chainId,
    };

    return this.db().raw(
      `insert into 
        ${tableName} 
          (amount, reference_metadata_id, crypto_wallet, valid, description, client_ip, client_agent, due_date, chain_id)
        values
          (:amount, :reference_metadata_id, :crypto_wallet, :valid, :description, :client_ip, :client_agent, :due_date, :chain_id);`,
      param,
    );
  }
}

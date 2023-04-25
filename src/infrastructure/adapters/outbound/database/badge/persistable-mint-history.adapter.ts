import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { PersistableMintHistoryPort } from '../../../../../domain/badge/ports/persistable-mint-history.port';
import { MintHistory } from '../../../../../domain/badge/entities/mint-history.entity';

const tableName = 'mint_history';
export class PersistableMintHistoryDbAdapter
  implements PersistableMintHistoryPort
{
  static instance: PersistableMintHistoryDbAdapter;
  private db: () => Knex<any, any[]>;

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

  create(mintHistory: MintHistory): Promise<void> {
    const param = {
      amount: mintHistory.amount,
      reference_metadata_id: mintHistory.referenceMetadataId,
      crypto_wallet: mintHistory.cryptoWallet,
      valid: mintHistory.valid,
      description: mintHistory.description,
      client_ip: mintHistory.clientIp,
      client_agent: mintHistory.clientAgent,
    };

    return this.db().raw(
      `insert into ${tableName} (amount, reference_metadata_id, crypto_wallet, valid, reason, client_ip, client_agent) values (:amount, :reference_metadata_id, :crypto_wallet, :valid, :reason, :client_ip, :client_agent);`,
      param,
    );
  }
}

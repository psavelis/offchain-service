import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { FetchableBalancePort } from '../../../../../domain/ledger/ports/fetchable-balance.port';

import { Balance } from '../../../../../domain/ledger/entities/balance.entity';
import { LayerType } from 'src/domain/common/enums/layer-type.enum';

export class FetchableBalanceDbAdapter implements FetchableBalancePort {
  static instance: FetchableBalanceDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): FetchableBalancePort {
    if (!FetchableBalanceDbAdapter.instance) {
      FetchableBalanceDbAdapter.instance = new FetchableBalanceDbAdapter(
        knexPostgresDb,
      );
    }

    return FetchableBalanceDbAdapter.instance;
  }

  async fetch(account: string): Promise<Balance | undefined> {
    const query = `select
      b.id as id,
      b.account as account,
      b.group as group,
      b.total as total,
      b.l1 as l1,
      b.l2 as l2,
      b.status as status,
      b.nonce as nonce,
      b.join_date as joinDate,
      b.exit_date as exitDate,
      b.last_journal_entry_date as lastJournalEntryDate,
      b.last_journal_movement_type as lastJournalMovementType,
      b.last_journal_entry_amount as lastJournalEntryAmount,
      b.last_journal_entry_chain_id as lastJournalEntryChainId,
      b.checksum as checksum,
      b.uint256_total as uint256total,
      b.created_at as createdAt,
      b.updated_at as updatedAt
    from balance b where b.account = :account`;

    const param = { account };

    const result = await this.db().raw(query, param);

    if (!result?.rows?.length) {
      return undefined;
    }

    return new Balance(
      {
        account: result.rows[0].account,
        group: result.rows[0].group,
        total: result.rows[0].total,
        [LayerType.L1]: result.rows[0].l1,
        [LayerType.L2]: result.rows[0].l2,
        status: result.rows[0].status,
        nonce: result.rows[0].nonce,
        joinDate: result.rows[0].joindate,
        exitDate: result.rows[0].exitdate,
        lastJournalEntryDate: result.rows[0].lastjournalentrydate,
        lastJournalMovementType: result.rows[0].lastjournalmovementtype,
        lastJournalEntryAmount: result.rows[0].lastjournalentryamount,
        lastJournalEntryChainId: result.rows[0].lastjournalentrychainid,
        checksum: result.rows[0].checksum,
        uint256total: result.rows[0].uint256total,
      },
      result.rows[0].id,
    );
  }
}

import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { PersistableBalanceJournalPort } from '../../../../../domain/ledger/ports/persistable-balance-journal.port';
import { Balance } from '../../../../../domain/ledger/entities/balance.entity';
import { JournalEntry } from '../../../../../domain/ledger/entities/journal-entry.entity';
import { LayerType } from '../../../../../domain/common/enums/layer-type.enum';

export class PersistableBalanceJournalDbAdapter
  implements PersistableBalanceJournalPort
{
  static instance: PersistableBalanceJournalDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableBalanceJournalPort {
    if (!PersistableBalanceJournalDbAdapter.instance) {
      PersistableBalanceJournalDbAdapter.instance =
        new PersistableBalanceJournalDbAdapter(knexPostgresDb);
    }

    return PersistableBalanceJournalDbAdapter.instance;
  }

  async save(balance: Balance, journalEntry: JournalEntry): Promise<void> {
    const param = {
      account: balance.account,
      group: balance.group,
      total: balance.total,
      l1: balance[LayerType.L1],
      l2: balance[LayerType.L2],
      status: balance.status,
      nonce: balance.nonce,
      joinDate: balance.joinDate,
      exitDate: balance.exitDate,
      lastJournalEntryDate: balance.lastJournalEntryDate,
      lastJournalMovementType: balance.lastJournalMovementType,
      lastJournalEntryAmount: balance.lastJournalEntryAmount,
      lastJournalEntryChainId: balance.lastJournalEntryChainId,
      checksum: balance.checksum,
      uint256Total: balance.uint256total,
      updatedAt: new Date(),
    };

    await this.db().raw(
      'insert into balance (account, group, total, l1, l2, status, nonce, join_date, exit_date, last_journal_entry_date, last_journal_movement_type, last_journal_entry_amount, last_journal_entry_chain_id, checksum, uint256_total) values (:account, :group, :total, :l1, :l2, :status, :nonce, :joinDate, :exitDate, :lastJournalEntryDate, :lastJournalMovementType, :lastJournalEntryAmount, :lastJournalEntryChainId, :checksum, :uint256Total) on conflict (account, group) do update set total = :total, l1 = :l1, l2 = :l2, status = :status, nonce = :nonce, join_date = :joinDate, exit_date = :exitDate, last_journal_entry_date = :lastJournalEntryDate, last_journal_movement_type = :lastJournalMovementType, last_journal_entry_amount = :lastJournalEntryAmount, last_journal_entry_chain_id = :lastJournalEntryChainId, checksum = :checksum, uint256_total = :uint256Total, updated_at = :updatedAt;',
      param,
    );

    const journalParam = {
      chainId: journalEntry.chainId,
      blockNumber: journalEntry.blockNumber,
      transactionHash: journalEntry.transactionHash,
      amount: journalEntry.amount,
      uint256Amount: journalEntry.uint256amount,
      movementType: journalEntry.movementType,
      entryType: journalEntry.entryType,
      account: journalEntry.account,
      accountGroup: journalEntry.accountGroup,
      isoCode: journalEntry.isoCode,
      logIndex: journalEntry.logIndex,
      entryDate: journalEntry.entryDate,
      gasUsed: journalEntry.gasUsed,
      cumulativeGasUsed: journalEntry.cumulativeGasUsed,
      effectiveGasPrice: journalEntry.effectiveGasPrice,
    };

    await this.db().raw(
      'insert into journal (chain_id, block_number, transaction_hash, amount, uint256_amount, movement_type, entry_type, account, account_group, iso_code, log_index, entry_date, gas_used, cumulative_gas_used, effective_gas_price) values (:chainId, :blockNumber, :transactionHash, :amount, :uint256Amount, :movementType, :entryType, :account, :accountGroup, :isoCode, :logIndex, :entryDate, :gasUsed, :cumulativeGasUsed, :effectiveGasPrice);',
      journalParam,
    );
  }
}

import { LayerType } from '../../common/enums/layer-type.enum';
import { type EncryptionPort } from '../../common/ports/encryption.port';
import { type LoggablePort } from '../../common/ports/loggable.port';
import { type Settings } from '../../common/settings';
import { type Nullable } from '../../common/util';
import { type CalculusPort } from '../../price/ports/calculus.port';
import { BalanceBuilder } from '../builders/balance.builder';
import { type Balance } from '../entities/balance.entity';
import { JournalEntry } from '../entities/journal-entry.entity';
import { type SyncLedgerInteractor } from '../interactors/sync-ledger.interactor';
import { type FetchableBalancePort } from '../ports/fetchable-balance.port';
import { type FetchableJournalEntryPort } from '../ports/fetchable-journal-entry.port';
import { type FetchableJournalTransferEventPort } from '../ports/fetchable-journal-transfer-event.port';
import { type PersistableBalanceJournalPort } from '../ports/persistable-balance-journal.port';

export class SyncLedgerUseCase implements SyncLedgerInteractor {
  private readonly cbcKey: string;
  private disconnected: Date | undefined = null;

  constructor(
    readonly settings: Settings,
    readonly logger: LoggablePort,
    readonly calculusPort: CalculusPort,
    readonly encryptionPort: EncryptionPort,
    readonly fetchableJournalEntryPort: FetchableJournalEntryPort,
    readonly fetchableJournalTransferEventPort: FetchableJournalTransferEventPort,
    readonly fetchableBalancePort: FetchableBalancePort,
    readonly persistableBalanceJournalPort: PersistableBalanceJournalPort,
  ) {
    this.cbcKey = this.settings.cbc.key.split('').reverse().join('');
  }

  async execute(): Promise<void> {
    let journalEntries: JournalEntry[];

    try {
      journalEntries = await this.fetchJournalEvents();

      if (this.disconnected) {
        const downtime = new Date().getTime() - this.disconnected.getTime();
        const format =
          downtime > 1000 ? `${downtime / 1000}s` : `${downtime}ms`;

        this.logger.info(`Alchemy API back up. (downtime: ${format})`);
      }

      this.disconnected = null;

      if (!journalEntries?.length) {
        return;
      }
    } catch (err) {
      if (!this.disconnected) {
        this.logger.warn(
          '[Journal Ledger] Alchemy API failed to respond. Retrying...',
        );

        this.disconnected = new Date();

        console.error(JSON.stringify(err));

        return;
      }
    }

    try {
      journalEntries.sort(JournalEntry.compare);
    } catch (err) {
      this.logger.error(err, `[Journal Ledger] Sort: ${err.message}`);

      return;
    }

    try {
      const creditAndDebitCount = await this.syncBalances(journalEntries);

      if (this.disconnected) {
        const downtime = new Date().getTime() - this.disconnected.getTime();
        const format =
          downtime > 1000 ? `${downtime / 1000}s` : `${downtime}ms`;

        this.logger.info(`Alchemy API back up. (downtime: ${format})`);
      }

      this.disconnected = null;

      if (creditAndDebitCount) {
        const totalTransactions = creditAndDebitCount / 2;

        this.logger.info(
          `[Balances] ${totalTransactions} new transfers captured from blockchain`,
        );
      }
    } catch (err) {
      if (!this.disconnected) {
        this.logger.warn(
          '[Balances] Alchemy API failed to respond. Retrying...',
        );

        this.disconnected = new Date();

        console.error(JSON.stringify(err));

        return;
      }
    }
  }

  private async syncBalances(ascendingJournal: JournalEntry[]) {
    let counter = 0;
    for (let index = 0; index < ascendingJournal.length; index++) {
      const entry = ascendingJournal[index];

      const existingEntry: Nullable<JournalEntry> =
        await this.fetchableJournalEntryPort.fetch(
          entry.chainId,
          entry.transactionHash,
          entry.logIndex,
          entry.movementType,
        );

      if (existingEntry?.transactionHash === entry.transactionHash) {
        continue;
      }

      const previousBalance: Nullable<Balance> =
        await this.fetchableBalancePort.fetch(entry.account);

      await this.validate(previousBalance);

      const { [entry.account]: currentBalance } = new BalanceBuilder(
        this.calculusPort,
        previousBalance,
      )
        .addJournalEntry(entry)
        .build();

      entry.entryType = currentBalance.status;
      currentBalance.checksum = await this.checksum(currentBalance);

      await this.persistableBalanceJournalPort.save(currentBalance, entry);
      counter += 1;
    }

    return counter;
  }

  private async fetchJournalEvents() {
    const { ethereumLastBlock, polygonLastBlock } =
      await this.fetchableJournalEntryPort.fetchLastBlocks();

    const journalEntries: JournalEntry[] =
      await this.fetchableJournalTransferEventPort.fetchByBlockNumber(
        ethereumLastBlock > 0 ? ethereumLastBlock : 0,
        polygonLastBlock > 0 ? polygonLastBlock : 0,
      );

    return journalEntries;
  }

  private async checksum(balance: Balance): Promise<string> {
    const dt = new Date();

    const securityTuple = `${dt.getTime()}|${balance.account}|${
      balance.total
    }|${balance[LayerType.L1]}|${balance[LayerType.L2]}|${
      balance.uint256total
    }|${balance.nonce}`;

    return this.encryptionPort.encrypt(
      securityTuple,
      balance.account,
      this.cbcKey,
    );
  }

  private async validate(balance: Nullable<Balance>): Promise<void> {
    if (!balance) {
      return;
    }

    const decryptedChecksum = await this.encryptionPort.decrypt(
      balance.checksum,
      balance.account,
      this.cbcKey,
    );

    const [, address, total, layer1total, layer2total, uint256total, nonce] =
      decryptedChecksum.split('|');

    const baseMessage = `[balance-check] invalid balance checksum for account ${balance.account}`;

    if (address !== balance.account) {
      const msg = `${baseMessage}: invalid address`;
      throw new Error(msg);
    }

    if (
      Number(total) > Number(balance.total) + 1 ||
      Number(total) < Number(balance.total) - 1
    ) {
      const msg = `${baseMessage}: invalid total`;
      throw new Error(msg);
    }

    if (
      Number(layer1total) > Number(balance[LayerType.L1]) + 1 ||
      Number(layer1total) < Number(balance[LayerType.L1]) - 1
    ) {
      const msg = `${baseMessage}: invalid LayerType.L1_total`;
      throw new Error(msg);
    }

    if (
      Number(layer2total) > Number(balance[LayerType.L2]) + 1 ||
      Number(layer2total) < Number(balance[LayerType.L2]) - 1
    ) {
      const msg = `${baseMessage}: invalid LayerType.L2_total`;
      throw new Error(msg);
    }

    if (uint256total !== balance.uint256total) {
      const msg = `${baseMessage}: invalid uint256total`;
      throw new Error(msg);
    }

    if (Number(nonce) !== Number(balance.nonce)) {
      const msg = `${baseMessage}: invalid nonce`;
      throw new Error(msg);
    }
  }
}

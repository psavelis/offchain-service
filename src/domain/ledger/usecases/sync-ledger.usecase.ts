import { Settings } from '../../common/settings';
import { Nullable } from '../../common/util';
import { BalanceBuilder } from '../builders/balance.builder';
import { Balance } from '../entities/balance.entity';
import { JournalEntry } from '../entities/journal-entry.entity';
import { SyncLedgerInteractor } from '../interactors/sync-ledger.interactor';
import { FetchableBalancePort } from '../ports/fetchable-balance.port';
import { FetchableJournalEntryPort } from '../ports/fetchable-journal-entry.port';
import { FetchableJournalTransferEventPort } from '../ports/fetchable-journal-transfer-event.port';
import { PersistableBalanceJournalPort } from '../ports/persistable-balance-journal.port';
import { EncryptionPort } from '../../common/ports/encryption.port';
import { LayerType } from '../../common/enums/layer-type.enum';
import { CalculusPort } from '../../price/ports/calculus.port';

export class SyncLedgerUseCase implements SyncLedgerInteractor {
  private cbcKey: string;

  constructor(
    readonly settings: Settings,
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
    const journalEntries = await this.fetchJournalEvents();

    if (!journalEntries?.length) {
      return;
    }

    journalEntries.sort(JournalEntry.compare);

    await this.syncBalances(journalEntries);
  }

  private async syncBalances(ascendingJournal: JournalEntry[]) {
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
    }
  }

  private async fetchJournalEvents() {
    const { ethereumLastBock, polygonLastBlock } =
      await this.fetchableJournalEntryPort.fetchLastBlocks();

    const journalEntries: JournalEntry[] =
      await this.fetchableJournalTransferEventPort.fetch(
        ethereumLastBock,
        polygonLastBlock,
      );

    return journalEntries;
  }

  private checksum(balance: Balance): Promise<string> {
    const dt = new Date();

    const securityTuple = `${dt.getTime()}|${balance.account}|${
      balance.total
    }|${balance[LayerType.L1]}|${balance[LayerType.L2]}|${balance.nonce}}`;

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

    const [_, address, total, layer1total, layer2total, nonce] =
      decryptedChecksum.split('|');

    const baseMessage = `[balance-check] invalid balance checksum for account ${balance.account}`;

    if (address !== balance.account) {
      const msg = `${baseMessage}: invalid address`;
      throw new Error(msg);
    }

    if (Number(total) !== balance.total) {
      const msg = `${baseMessage}: invalid total`;
      throw new Error(msg);
    }

    if (Number(layer1total) !== balance[LayerType.L1]) {
      const msg = `${baseMessage}: invalid LayerType.L1_total`;
      throw new Error(msg);
    }

    if (Number(layer2total) !== balance[LayerType.L2]) {
      const msg = `${baseMessage}: invalid LayerType.L2_total`;
      throw new Error(msg);
    }

    if (Number(nonce) !== balance.nonce) {
      const msg = `${baseMessage}: invalid nonce`;
      throw new Error(msg);
    }
  }
}

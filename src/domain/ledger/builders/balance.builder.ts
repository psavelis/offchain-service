import { LayerType } from '../../common/enums/layer-type.enum';
import { type CalculusPort } from '../../price/ports/calculus.port';
import { Balance } from '../entities/balance.entity';
import {
  AccountGroup,
  JournalEntryType,
  JournalMovementType,
  type JournalEntry,
} from '../entities/journal-entry.entity';

export type Account = string;

export class BalanceBuilder {
  private balances: Record<Account, Balance>;

  constructor(
    readonly calculusPort: CalculusPort,
    ...balances: Array<Balance | undefined>
  ) {
    this.initialize();

    for (const balance of balances) {
      if (!balance?.account) {
        continue;
      }

      this.balances[balance.account] = balance;
    }
  }

  public addJournalEntry(journalEntry: JournalEntry): this {
    this.balances[journalEntry.account] =
      this.balances[journalEntry.account] ||
      new Balance({
        account: journalEntry.account,
        group: journalEntry.accountGroup,
        total: 0.0,
        [LayerType.L1]: 0.0,
        [LayerType.L2]: 0.0,
        status: JournalEntryType.Join,
        lastJournalEntryDate: journalEntry.entryDate,
        lastJournalMovementType: journalEntry.movementType,
        lastJournalEntryAmount: journalEntry.amount,
        lastJournalEntryChainId: journalEntry.chain.id,
        joinDate: journalEntry.entryDate,
        exitDate: undefined,
        nonce: 0,
        checksum: '',
        uint256total: '0',
      });

    const balance = this.balances[journalEntry.account];
    const { total: previousTotal } = balance;

    balance.total = Number(balance.total) + Number(journalEntry.amount);
    balance[journalEntry.chain.layer] =
      Number(balance[journalEntry.chain.layer]) + Number(journalEntry.amount);

    if (balance.total <= 0.0) {
      balance.status = JournalEntryType.Exit;
      balance.exitDate = journalEntry.entryDate;
    } else if (Number(previousTotal) <= 0.0 && balance.total > 0.0) {
      balance.status = JournalEntryType.Join;
      balance.joinDate = balance.joinDate || journalEntry.entryDate;
      balance.exitDate = undefined;
    } else {
      balance.status = JournalEntryType.Movement;
      balance.exitDate = undefined;
    }

    balance.lastJournalEntryDate = journalEntry.entryDate;
    balance.lastJournalMovementType = journalEntry.movementType;
    balance.lastJournalEntryAmount = journalEntry.amount;
    balance.lastJournalEntryChainId = journalEntry.chain.id;
    balance.group = journalEntry.accountGroup;
    balance.nonce = Number(balance.nonce) + 1;

    const isMintOrFxTunnel =
      journalEntry.movementType === JournalMovementType.Debit &&
      (journalEntry.accountGroup === AccountGroup.Chain ||
        journalEntry.accountGroup === AccountGroup.Bridge);

    if (isMintOrFxTunnel) {
      balance.total = Number(balance.total) - Number(journalEntry.amount);
      balance[journalEntry.chain.layer] =
        Number(balance[journalEntry.chain.layer]) - Number(journalEntry.amount);
      balance.joinDate = balance.joinDate || journalEntry.entryDate;

      return this;
    }

    const current256Amount = {
      isoCode: journalEntry.isoCode,
      unassignedNumber: balance.uint256total,
      decimals: 18,
    };

    const journal256Amount = {
      isoCode: journalEntry.isoCode,
      unassignedNumber: journalEntry.uint256amount,
      decimals: 18,
    };

    const { unassignedNumber: uint256total } =
      journalEntry.movementType === JournalMovementType.Credit
        ? this.calculusPort.sum(current256Amount, journal256Amount)
        : this.calculusPort.sub(current256Amount, journal256Amount);

    balance.uint256total = uint256total;

    return this;
  }

  public build(): Record<Account, Balance> {
    return this.balances;
  }

  public reset(): void {
    this.initialize();
  }

  private initialize(): void {
    this.balances = {};
  }
}

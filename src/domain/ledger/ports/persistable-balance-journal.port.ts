import { Balance } from '../entities/balance.entity';
import { JournalEntry } from '../entities/journal-entry.entity';

export interface PersistableBalanceJournalPort {
  save(balance: Balance, journalEntry: JournalEntry): Promise<void>;
}

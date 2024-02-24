import {type Balance} from '../entities/balance.entity';
import {type JournalEntry} from '../entities/journal-entry.entity';

export type PersistableBalanceJournalPort = {
	save(balance: Balance, journalEntry: JournalEntry): Promise<void>;
};

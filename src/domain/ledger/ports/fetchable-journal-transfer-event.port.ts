import {type JournalEntry} from '../entities/journal-entry.entity';

export type FetchableJournalTransferEventPort = {
	fetchByBlockNumber(
		ethereumLastBlock: number,
		polygonLastBlock: number,
	): Promise<JournalEntry[]>;
};

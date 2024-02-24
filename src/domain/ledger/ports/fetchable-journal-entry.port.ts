import {
  type JournalEntry,
  type JournalMovementType,
} from '../entities/journal-entry.entity';

export type FetchableJournalEntryPort = {
	fetch(
		chainId: number,
		transactionHash: string,
		logIndex: number,
		movementType: JournalMovementType,
	): Promise<JournalEntry | undefined>;

	fetchLastBlocks(): Promise<{
		ethereumLastBlock: number;
		polygonLastBlock: number;
	}>;
};

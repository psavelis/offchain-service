import {
  JournalEntry,
  JournalMovementType,
} from '../entities/journal-entry.entity';

export interface FetchableJournalEntryPort {
  fetch(
    chainId: number,
    transactionHash: string,
    logIndex: number,
    movementType: JournalMovementType,
  ): Promise<JournalEntry | undefined>;

  fetchLastBlocks(): Promise<{
    ethereumLastBock: number;
    polygonLastBlock: number;
  }>;
}

import { JournalEntry } from '../entities/journal-entry.entity';

export interface FetchableJournalTransferEventPort {
  fetchByBlockNumber(
    ethereumLastBlock: number,
    polygonLastBlock: number,
  ): Promise<JournalEntry[]>;
}

import { JournalEntry } from '../entities/journal-entry.entity';

export interface FetchableJournalTransferEventPort {
  fetchByBlockNumber(
    ethereumLastBock: number,
    polygonLastBlock: number,
  ): Promise<JournalEntry[]>;
}

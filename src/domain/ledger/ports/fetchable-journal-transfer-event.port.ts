import { JournalEntry } from '../entities/journal-entry.entity';

export interface FetchableJournalTransferEventPort {
  fetch(
    ethereumLastBock: number,
    polygonLastBlock: number,
  ): Promise<JournalEntry[]>;
}

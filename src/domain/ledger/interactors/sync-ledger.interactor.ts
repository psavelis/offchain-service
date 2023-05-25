export const SyncLedger = Symbol('SYNC_LEDGER');

export interface SyncLedgerInteractor {
  execute(): Promise<void>;
}

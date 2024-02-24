export const SyncLedger = Symbol('SYNC_LEDGER');

export type SyncLedgerInteractor = {
	execute(): Promise<void>;
};

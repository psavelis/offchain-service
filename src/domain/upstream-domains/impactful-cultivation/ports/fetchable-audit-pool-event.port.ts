import {type AuditPoolEvent} from '../entities/audit-pool-event.entity';

export type FetchableAuditPoolStoredEventPort = {
	fetchByBlockNumber(
		ethereumLastBlock: number,
		polygonLastBlock: number,
	): Promise<AuditPoolEvent[]>;

	fetchByFingerprint(fingerprint: string): Promise<AuditPoolEvent | undefined>;

	fetchLastBlocks(): Promise<{
		ethereumLastBlock: number;
		polygonLastBlock: number;
	}>;
};

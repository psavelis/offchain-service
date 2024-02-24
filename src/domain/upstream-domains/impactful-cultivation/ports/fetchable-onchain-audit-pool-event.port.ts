import {type AuditPoolEvent} from '../entities/audit-pool-event.entity';

export type FetchableOnChainAuditPoolEventPort = {
	fetchByBlockNumber(
		ethereumLastBlock: number,
		polygonLastBlock: number,
	): Promise<AuditPoolEvent[]>;
};

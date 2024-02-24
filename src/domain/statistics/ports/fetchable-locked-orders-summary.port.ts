import {type LockedOrdersSummaryDto} from '../dtos/locked-orders-summary.dto';

export type FetchableLockedOrdersSummaryPort = {
	fetch(): Promise<LockedOrdersSummaryDto>;
};

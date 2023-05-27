import { LockedOrdersSummaryDto } from '../dtos/locked-orders-summary.dto';

export interface FetchableLockedOrdersSummaryPort {
  fetch(): Promise<LockedOrdersSummaryDto>;
}

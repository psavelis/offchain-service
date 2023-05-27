import { KnnSummaryDto } from '../dtos/knn-summary.dto';

export interface FetchableKnnSummaryPort {
  fetch(): Promise<KnnSummaryDto>;
}

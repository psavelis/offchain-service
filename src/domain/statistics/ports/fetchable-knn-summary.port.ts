import {type KnnSummaryDto} from '../dtos/knn-summary.dto';

export type FetchableKnnSummaryPort = {
	fetch(): Promise<KnnSummaryDto>;
};

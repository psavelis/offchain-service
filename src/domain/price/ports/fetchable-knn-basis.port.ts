import {type KnnQuoteBasis} from '../value-objects/knn-quote-basis.value-object';

export type FetchableKnnBasisPort = {
	fetch(forceReload?: boolean): Promise<KnnQuoteBasis>;
};

import { KnnQuoteBasis } from '../value-objects/knn-quote-basis.value-object';

export interface FetchableKnnBasisPort {
  fetch(): Promise<KnnQuoteBasis>;
}

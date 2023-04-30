import { MaticQuoteBasis } from '../value-objects/matic-quote-basis.value-object';

export interface FetchableMaticBasisPort {
  fetch(forceReload?: boolean): Promise<MaticQuoteBasis>;
}

import { type MaticQuoteBasis } from '../value-objects/matic-quote-basis.value-object';

export type FetchableMaticBasisPort = {
  fetch(forceReload?: boolean): Promise<MaticQuoteBasis>;
};

import { UsdQuoteBasis } from '../value-objects/usd-quote-basis.value-object';

export interface FetchableUsdBasisPort {
  fetch(): Promise<UsdQuoteBasis>;
}

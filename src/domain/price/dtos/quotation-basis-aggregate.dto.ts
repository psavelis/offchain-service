import { EthQuoteBasis } from '../value-objects/eth-quote-basis.value-object';
import { KnnQuoteBasis } from '../value-objects/knn-quote-basis.value-object';
import { UsdQuoteBasis } from '../value-objects/usd-quote-basis.value-object';

export interface QuotationBasisAggregateDto
  extends Record<
    'USD' | 'KNN' | 'ETH',
    UsdQuoteBasis | KnnQuoteBasis | EthQuoteBasis
  > {}

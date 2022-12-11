import { QuotationBasisAggregateDto } from '../../../../../domain/price/dtos/quotation-basis-aggregate.dto';
import { EthQuoteBasis } from '../../../../../domain/price/value-objects/eth-quote-basis.value-object';
import { KnnQuoteBasis } from '../../../../../domain/price/value-objects/knn-quote-basis.value-object';
import { UsdQuoteBasis } from '../../../../../domain/price/value-objects/usd-quote-basis.value-object';

const expiredQuotation = {
  BRL: 0,
  USD: 0,
  ETH: 0,
  expiration: new Date(0),
};

export class InMemoryQuotationCache {
  static USD: UsdQuoteBasis = expiredQuotation;
  static KNN: KnnQuoteBasis = expiredQuotation;
  static ETH: EthQuoteBasis = expiredQuotation;
}

import { QuotationBasisAggregateDto } from '../dtos/quotation-basis-aggregate.dto';

export interface FetchPriceInteractor {
  fetch(): Promise<QuotationBasisAggregateDto>;
}

import { IsoCodeType } from '../../common/enums/iso-codes.enum';
import { CurrencyAmount } from '../value-objects/currency-amount.value-object';
import { QuotationAggregate } from '../value-objects/quotation-aggregate.value-object';

export const KnnToCurrencies = Symbol('KNN_TO_CURRENCIES');

export interface KnnToCurrenciesInteractor {
  execute(entry: CurrencyAmount<IsoCodeType.KNN>): Promise<QuotationAggregate>;
}

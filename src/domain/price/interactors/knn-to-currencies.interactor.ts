import {type IsoCodeType} from '../../common/enums/iso-codes.enum';
import {type CurrencyAmount} from '../value-objects/currency-amount.value-object';
import {type QuotationAggregate} from '../value-objects/quotation-aggregate.value-object';

export const KnnToCurrencies = Symbol('KNN_TO_CURRENCIES');

export type KnnToCurrenciesInteractor = {
	execute(entry: CurrencyAmount<IsoCodeType.KNN>): Promise<QuotationAggregate>;
};

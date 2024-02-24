import { type IsoCodeType } from '../../common/enums/iso-codes.enum';
import { type CurrencyAmount } from '../value-objects/currency-amount.value-object';
import { type QuotationAggregate } from '../value-objects/quotation-aggregate.value-object';
import { type CreateQuoteUseCase } from './create-quote.usecase';

export class KnnToCurrenciesUseCase {
  constructor(readonly createQuoteUseCase: CreateQuoteUseCase) {}

  async execute(
    entry: CurrencyAmount<IsoCodeType.KNN>,
  ): Promise<QuotationAggregate> {
    const [ethBasis, knnBasis, usdBasis, maticBasis] = await Promise.all([
      this.createQuoteUseCase.ethPort.fetch(),
      this.createQuoteUseCase.knnPort.fetch(),
      this.createQuoteUseCase.usdPort.fetch(),
      this.createQuoteUseCase.maticPort.fetch(),
    ]);

    const knnToCurrencies: QuotationAggregate =
      await this.createQuoteUseCase.calculateKNN(
        entry,
        usdBasis,
        knnBasis,
        ethBasis,
        maticBasis,
      );

    return knnToCurrencies;
  }
}

import { QuotationBasisAggregateDto } from '../dtos/quotation-basis-aggregate.dto';
import { FetchPriceInteractor } from '../interactors/fetch-price.interactor';
import { FetchableEthBasisPort } from '../ports/fetchable-eth-basis.port';
import { FetchableKnnBasisPort } from '../ports/fetchable-knn-basis.port';
import { FetchableUsdBasisPort } from '../ports/fetchable-usd-basis.port';

export class FetchPriceUseCase implements FetchPriceInteractor {
  constructor(
    readonly ethPort: FetchableEthBasisPort,
    readonly knnPort: FetchableKnnBasisPort,
    readonly usdPort: FetchableUsdBasisPort,
  ) {}

  async fetch(): Promise<QuotationBasisAggregateDto> {
    const [ETH, KNN, USD] = await Promise.all([
      this.ethPort.fetch(),
      this.knnPort.fetch(),
      this.usdPort.fetch(),
    ]);

    return {
      ETH,
      KNN,
      USD,
    };
  }
}

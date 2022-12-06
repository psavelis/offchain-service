import { utils } from 'ethers';
import { FetchableKnnBasisPort } from '../../../../../domain/price/ports/fetchable-knn-basis.port';
import { KnnQuoteBasis } from '../../../../../domain/price/value-objects/knn-quote-basis.value-object';
import { IKannaProtocolProvider } from '../kanna.provider';
import { KannaPreSale } from '../protocol';

const ETH_QUOTATION_DECIMALS = 18;
const CHAINLINK_USD_QUOTATION_DECIMALS = 8;

export class FetchableKnnBasisJsonRpcAdapter implements FetchableKnnBasisPort {
  static instance: FetchableKnnBasisPort;

  private constructor(readonly provider: IKannaProtocolProvider) {}

  static getInstance(provider: IKannaProtocolProvider) {
    if (!FetchableKnnBasisJsonRpcAdapter.instance) {
      FetchableKnnBasisJsonRpcAdapter.instance =
        new FetchableKnnBasisJsonRpcAdapter(provider);
    }

    return FetchableKnnBasisJsonRpcAdapter.instance;
  }

  async fetch(): Promise<KnnQuoteBasis> {
    const presale: KannaPreSale = await this.provider.preSale();

    const [priceInChainLinkUsd1e8, [priceInWei1e18, usdQuotation]] =
      await Promise.all([
        presale.knnPriceInUSD(),
        presale.convertToWEI(utils.parseUnits('1.0', ETH_QUOTATION_DECIMALS)),
      ]);

    const quotationBasis: KnnQuoteBasis = {
      USD: {
        unassignedNumber: priceInChainLinkUsd1e8.toString(),
        decimals: CHAINLINK_USD_QUOTATION_DECIMALS,
        isoCode: 'USD',
      },
      ETH: {
        unassignedNumber: priceInWei1e18.toString(),
        decimals: ETH_QUOTATION_DECIMALS,
        isoCode: 'ETH',
      },
      expiration: new Date(),
    };

    return quotationBasis;
  }
}

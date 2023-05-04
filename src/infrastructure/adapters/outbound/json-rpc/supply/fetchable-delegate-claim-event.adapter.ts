import { NetworkType } from '../../../../../domain/common/enums/network-type.enum';
import { formatDecimals } from '../../../../../domain/common/util';
import { OnChainUserReceipt } from '../../../../../domain/supply/dtos/onchain-user-receipt.dto';
import { FetchableDelegateClaimEventPort } from '../../../../../domain/supply/ports/fetchable-delegate-claim-event.port';
import { IKannaProtocolProvider } from '../kanna.provider';
import { ClaimEvent } from '../protocol/contracts/KannaPreSale';

export class FetchableDelegateClaimEventRpcAdapter
  implements FetchableDelegateClaimEventPort
{
  constructor(readonly provider: IKannaProtocolProvider) {}

  async fetch(): Promise<OnChainUserReceipt[]> {
    const [polygonSale, sale, preSale] = await Promise.all([
      this.provider.polygonSale(),
      this.provider.sale(),
      this.provider.legacyPreSale(),
    ]);

    const [polygonSaleEvents, saleEvents, preSaleEvents]: ClaimEvent[][] =
      await Promise.all([
        polygonSale.queryFilter(polygonSale.filters.Claim()),
        sale.queryFilter(sale.filters.Claim()),
        preSale.queryFilter(preSale.filters.Claim()),
      ]);

    const isProduction = process.env.NODE_ENV === 'production';

    const polygonChainId = isProduction
      ? NetworkType.Polygon
      : NetworkType.PolygonMumbai;
    const ethereumChainId = isProduction
      ? NetworkType.Ethereum
      : NetworkType.EthereumGoerli;

    const rawEvents = [
      polygonSaleEvents.map((event) => ({ ...event, chainId: polygonChainId })),
      saleEvents.map((event) => ({ ...event, chainId: ethereumChainId })),
      preSaleEvents.map((event) => ({ ...event, chainId: ethereumChainId })),
    ].flat();

    const receipts = Promise.all(
      rawEvents.map((event) => {
        const { blockNumber, transactionHash, chainId } = event;

        const { holder, ref, amountInKNN } = event.args;

        return event
          .getTransactionReceipt()
          .then(
            ({ from, to, gasUsed, cumulativeGasUsed, effectiveGasPrice }) => {
              const userReceipt: OnChainUserReceipt = {
                chainId,
                cryptoWallet: holder,
                paymentSequence: Number(ref),
                amountInKnn: Number(formatDecimals(amountInKNN.toString(), 18)),
                blockNumber,
                transactionHash,
                from,
                to,
                gasUsed: Number(gasUsed),
                cumulativeGasUsed: Number(cumulativeGasUsed),
                effectiveGasPrice: Number(effectiveGasPrice),
              };

              return userReceipt;
            },
          );
      }),
    );

    return receipts;
  }
}

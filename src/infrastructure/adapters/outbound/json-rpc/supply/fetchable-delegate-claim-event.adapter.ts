import { LayerType } from '../../../../../domain/common/enums/layer-type.enum';
import { NetworkType } from '../../../../../domain/common/enums/network-type.enum';
import { Settings } from '../../../../../domain/common/settings';
import { formatDecimals } from '../../../../../domain/common/util';
import { OnChainUserReceipt } from '../../../../../domain/supply/dtos/onchain-user-receipt.dto';
import { FetchableDelegateClaimEventPort } from '../../../../../domain/supply/ports/fetchable-delegate-claim-event.port';
import { IKannaProtocolProvider } from '../kanna.provider';
import { ClaimEvent } from '../protocol/contracts/KannaPreSale';

export class FetchableDelegateClaimEventRpcAdapter
  implements FetchableDelegateClaimEventPort
{
  lastEthereumBlockNumber: number | undefined = undefined;
  lastPolygonBlockNumber: number | undefined = undefined;

  constructor(
    readonly settings: Settings,
    readonly provider: IKannaProtocolProvider,
  ) {}

  async fetch(): Promise<OnChainUserReceipt[]> {
    const rawEvents = await this.getEvents();

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
                uint256Amount: amountInKNN.toString(),
              };

              return userReceipt;
            },
          )
          .then((receipt: OnChainUserReceipt) => {
            return event
              .getBlock()
              .then((block) => {
                const pastDue = new Date(block.timestamp * 1000);
                return { ...receipt, pastDue };
              })
              .catch(() => receipt);
          });
      }),
    );

    return receipts;
  }

  private async getEvents() {
    if (this.settings.blockchain.current.layer === LayerType.L1) {
      return this.getLayer1OnlyEvents();
    }

    return this.getL1andL2Events();
  }

  private async getLayer1OnlyEvents() {
    const [sale, preSale] = await Promise.all([
      this.provider.sale(),
      this.provider.legacyPreSale(),
    ]);

    const [saleEvents, preSaleEvents]: ClaimEvent[][] = await Promise.all([
      sale.queryFilter(sale.filters.Claim(), this.lastEthereumBlockNumber),
      preSale.queryFilter(
        preSale.filters.Claim(),
        this.lastEthereumBlockNumber,
      ),
    ]);

    if (this.settings.blockchain.current.layer !== LayerType.L1) {
      throw new Error(
        `Cannot fetch L1 events on L2 chain ${this.settings.blockchain.current.id}`,
      );
    }

    const chainId = this.settings.blockchain.current.id;

    const rawEvents = [
      saleEvents.map((event) => {
        if (
          !this.lastEthereumBlockNumber ||
          event.blockNumber > this.lastEthereumBlockNumber
        ) {
          this.lastEthereumBlockNumber = event.blockNumber;
        }

        return { ...event, chainId };
      }),
      preSaleEvents.map((event) => {
        if (
          !this.lastEthereumBlockNumber ||
          event.blockNumber > this.lastEthereumBlockNumber
        ) {
          this.lastEthereumBlockNumber = event.blockNumber;
        }

        return { ...event, chainId };
      }),
    ].flat();

    return rawEvents;
  }

  private async getL1andL2Events() {
    const [polygonSale, sale, preSale] = await Promise.all([
      this.provider.polygonSale(),
      this.provider.sale(),
      this.provider.legacyPreSale(),
    ]);

    const [polygonSaleEvents, saleEvents, preSaleEvents]: ClaimEvent[][] =
      await Promise.all([
        polygonSale.queryFilter(
          polygonSale.filters.Claim(),
          this.lastPolygonBlockNumber,
        ),
        sale.queryFilter(sale.filters.Claim(), this.lastEthereumBlockNumber),
        preSale.queryFilter(
          preSale.filters.Claim(),
          this.lastEthereumBlockNumber,
        ),
      ]);

    const isProduction = process.env.NODE_ENV === 'production';

    const ethereumChainId = isProduction
      ? NetworkType.Ethereum
      : NetworkType.EthereumGoerli;

    const polygonChainId = isProduction
      ? NetworkType.Polygon
      : NetworkType.PolygonMumbai;

    const rawEvents = [
      polygonSaleEvents.map((event) => {
        if (
          !this.lastPolygonBlockNumber ||
          event.blockNumber > this.lastPolygonBlockNumber
        ) {
          this.lastPolygonBlockNumber = event.blockNumber;
        }

        return { ...event, chainId: polygonChainId };
      }),
      saleEvents.map((event) => {
        if (
          !this.lastEthereumBlockNumber ||
          event.blockNumber > this.lastEthereumBlockNumber
        ) {
          this.lastEthereumBlockNumber = event.blockNumber;
        }

        return { ...event, chainId: ethereumChainId };
      }),
      preSaleEvents.map((event) => {
        if (
          !this.lastEthereumBlockNumber ||
          event.blockNumber > this.lastEthereumBlockNumber
        ) {
          this.lastEthereumBlockNumber = event.blockNumber;
        }

        return { ...event, chainId: ethereumChainId };
      }),
    ].flat();
    return rawEvents;
  }
}

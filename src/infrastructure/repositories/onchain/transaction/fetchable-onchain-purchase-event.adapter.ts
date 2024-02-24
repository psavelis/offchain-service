import { Chain } from '../../../../domain/common/entities/chain.entity';
import { LayerType } from '../../../../domain/common/enums/layer-type.enum';
import { NetworkType } from '../../../../domain/common/enums/network-type.enum';
import { type Settings } from '../../../../domain/common/settings';
import { PurchaseBuilder } from '../../../../domain/transaction/builders/purchase.builder';
import { type Purchase } from '../../../../domain/transaction/entities/purchase.entity';
import { type FetchableOnChainPurchaseEventPort } from '../../../../domain/transaction/ports/fetchable-onchain-purchase-event.port';
import { type IKannaProtocolProvider } from '../kanna.provider';
import { type PurchaseEvent } from '../protocol/contracts/KannaPreSale';

export class FetchableOnChainPurchaseEventRpcAdapter
implements FetchableOnChainPurchaseEventPort
{
  constructor(
    readonly settings: Settings,
    readonly provider: IKannaProtocolProvider,
  ) {}

  async fetchByBlockNumber(
    fromEthereumBlock: number,
    fromPolygonBlock: number,
  ): Promise<Purchase[]> {
    const rawEvents = await this.getEvents(fromEthereumBlock, fromPolygonBlock);

    const purchases = Promise.all(
      rawEvents.map(async (event) => {
        const { blockNumber, transactionHash, chainId } = event;

        const {
          holder,
          amountInWEI,
          knnPriceInUSD,
          ethPriceInUSD,
          amountInKNN,
        } = event.args;

        return event
          .getTransactionReceipt()
          .then(({ to, gasUsed, cumulativeGasUsed, effectiveGasPrice }) => {
            const purchaseBuilder = new PurchaseBuilder(
              holder,
              to,
              chainId,
              transactionHash,
              Number(knnPriceInUSD.toString()),
              Number(amountInKNN.toString()),
              Number(gasUsed.toString()),
              Number(cumulativeGasUsed.toString),
              Number(effectiveGasPrice.toString()),
              blockNumber,
            );

            return purchaseBuilder;
          })
          .then(async (builder: PurchaseBuilder) => {
            return event
              .getBlock()
              .then((block) => {
                const pastDue = new Date(block.timestamp * 1000);
                return new Chain(chainId).layer === LayerType.L1
                  ? builder
                    .eth(
                      Number(ethPriceInUSD.toString()),
                      Number(amountInWEI.toString()),
                      pastDue,
                    )
                    .build()
                  : builder
                    .matic(
                      Number(ethPriceInUSD.toString()),
                      Number(amountInWEI.toString()),
                      pastDue,
                    )
                    .build();
              })
              .catch((err) => {
                console.error(`[purchase][event] error ${err.message}`);

                return builder.build();
              });
          });
      }),
    );

    return purchases;
  }

  private async getEvents(fromEthereumBlock: number, fromPolygonBlock: number) {
    if (this.settings.blockchain.current.layer === LayerType.L1) {
      return this.getLayer1OnlyEvents(fromEthereumBlock);
    }

    return this.getL1andL2Events(fromEthereumBlock, fromPolygonBlock);
  }

  private async getLayer1OnlyEvents(fromEthereumBlock: number) {
    const [sale, preSale, dynamicSale] = await Promise.all([
      this.provider.sale(),
      this.provider.legacyPreSale(),
      this.provider.dynamicSale(),
    ]);

    const [saleEvents, preSaleEvents, dynamicSaleEvents]: PurchaseEvent[][] =
      await Promise.all([
        sale.queryFilter(sale.filters.Purchase(), fromEthereumBlock),
        preSale.queryFilter(preSale.filters.Purchase(), fromEthereumBlock),
        dynamicSale.queryFilter(
          dynamicSale.filters.Purchase(),
          fromEthereumBlock,
        ),
      ]);

    if (this.settings.blockchain.current.layer !== LayerType.L1) {
      throw new Error(
        `Cannot fetch L1 events on L2 chain ${this.settings.blockchain.current.id}`,
      );
    }

    const chainId = this.settings.blockchain.current.id;

    const rawEvents = [
      saleEvents.map((event) => ({ ...event, chainId })),
      preSaleEvents.map((event) => ({ ...event, chainId })),
      dynamicSaleEvents.map((event) => ({ ...event, chainId })),
    ].flat();

    return rawEvents;
  }

  private async getL1andL2Events(
    fromEthereumBlock: number,
    fromPolygonBlock: number,
  ) {
    const [polygonSale, sale, preSale, dynamicSale, polygonDynamicSale] =
      await Promise.all([
        this.provider.polygonSale(),
        this.provider.sale(),
        this.provider.legacyPreSale(),
        this.provider.dynamicSale(),
        this.provider.dynamicPolygonSale(),
      ]);

    const [
      polygonSaleEvents,
      saleEvents,
      preSaleEvents,
      dynamicSaleEvents,
      polygonDynamicSaleEvents,
    ]: PurchaseEvent[][] = await Promise.all([
      polygonSale.queryFilter(polygonSale.filters.Purchase(), fromPolygonBlock),
      sale.queryFilter(sale.filters.Purchase(), fromEthereumBlock),
      preSale.queryFilter(preSale.filters.Purchase(), fromEthereumBlock),
      dynamicSale.queryFilter(
        dynamicSale.filters.Purchase(),
        fromEthereumBlock,
      ),
      polygonDynamicSale.queryFilter(
        polygonDynamicSale.filters.Purchase(),
        fromPolygonBlock,
      ),
    ]);

    const isProduction = process.env.NODE_ENV === 'production';

    const ethereumChainId = isProduction
      ? NetworkType.Ethereum
      : NetworkType.EthereumSepolia;

    const polygonChainId = isProduction
      ? NetworkType.Polygon
      : NetworkType.PolygonMumbai;

    const rawEvents = [
      polygonSaleEvents.map((event) => ({ ...event, chainId: polygonChainId })),
      saleEvents.map((event) => ({ ...event, chainId: ethereumChainId })),
      preSaleEvents.map((event) => ({ ...event, chainId: ethereumChainId })),
      dynamicSaleEvents.map((event) => ({
        ...event,
        chainId: ethereumChainId,
      })),
      polygonDynamicSaleEvents.map((event) => ({
        ...event,
        chainId: polygonChainId,
      })),
    ].flat();

    return rawEvents;
  }
}

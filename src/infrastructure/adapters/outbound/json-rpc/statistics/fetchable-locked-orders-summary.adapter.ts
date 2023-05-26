import { LayerType } from '../../../../../domain/common/enums/layer-type.enum';
import { Settings } from '../../../../../domain/common/settings';
import { formatDecimals } from '../../../../../domain/common/util';
import { LockedOrdersSummaryDto } from '../../../../../domain/statistics/dtos/locked-orders-summary.dto';
import { FetchableLockedOrdersSummaryPort } from '../../../../../domain/statistics/ports/fetchable-locked-orders-summary.port';
import { IKannaProtocolProvider } from '../kanna.provider';
import { KannaPreSale } from '../protocol/contracts';

export class FetchableLockedOrdersSummaryRpcAdapter
  implements FetchableLockedOrdersSummaryPort
{
  static instance: FetchableLockedOrdersSummaryPort;

  private constructor(
    readonly settings: Settings,
    readonly provider: IKannaProtocolProvider,
  ) {}

  static getInstance(settings: Settings, provider: IKannaProtocolProvider) {
    if (!FetchableLockedOrdersSummaryRpcAdapter.instance) {
      FetchableLockedOrdersSummaryRpcAdapter.instance =
        new FetchableLockedOrdersSummaryRpcAdapter(settings, provider);
    }

    return FetchableLockedOrdersSummaryRpcAdapter.instance;
  }

  async fetch(): Promise<LockedOrdersSummaryDto> {
    const saleContracts: KannaPreSale[] = await this.getSaleContracts();
    const presaleContract: KannaPreSale = await this.provider.legacyPreSale();

    const result: LockedOrdersSummaryDto = {
      lockedTokens: {
        totalAmount: 0.0,
        preSale: 0.0,
        sale: 0.0,
      },
    };

    const presaleLockedUint256 = await presaleContract.knnLocked();

    const presaleLockedNumber = Number(
      formatDecimals(presaleLockedUint256.toString(), 18, {
        truncateDecimals: 8,
      }),
    );

    result.lockedTokens.totalAmount += presaleLockedNumber;
    result.lockedTokens.preSale = presaleLockedNumber;

    for (const contract of saleContracts) {
      const totalLockedUint256 = await contract.knnLocked();

      const totalLockedNumber = Number(
        formatDecimals(totalLockedUint256.toString(), 18, {
          truncateDecimals: 8,
        }),
      );

      result.lockedTokens.totalAmount += totalLockedNumber;
      result.lockedTokens.sale += totalLockedNumber;
    }

    return result;
  }

  async getSaleContracts(): Promise<KannaPreSale[]> {
    const contracts: KannaPreSale[] = [await this.provider.sale()];

    if (this.settings.blockchain.current.layer !== LayerType.L1) {
      const polygonSale: KannaPreSale = await this.provider.polygonSale();
      contracts.push(polygonSale);
    }

    return contracts;
  }
}

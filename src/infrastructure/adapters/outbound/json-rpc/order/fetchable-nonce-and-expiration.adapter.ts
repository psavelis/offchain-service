import { Chain } from '../../../../../domain/common/entities/chain.entity';
import { LayerType } from '../../../../../domain/common/enums/layer-type.enum';
import { Settings } from '../../../../../domain/common/settings';
import { NonceAndExpirationDto } from '../../../../../domain/order/dtos/nonce-and-expiration.dto';
import { FetchableNonceAndExpirationPort } from '../../../../../domain/order/ports/fetchable-nonce-and-expiration.port';
import { IKannaProtocolProvider } from '../kanna.provider';
import { KannaDynamicPriceSale } from '../protocol/contracts';

export class FetchableNonceAndExpirationJsonRpcAdapter
  implements FetchableNonceAndExpirationPort
{
  static instance: FetchableNonceAndExpirationPort;

  private constructor(
    readonly settings: Settings,
    readonly provider: IKannaProtocolProvider,
  ) {}

  static getInstance(settings: Settings, provider: IKannaProtocolProvider) {
    if (!FetchableNonceAndExpirationJsonRpcAdapter.instance) {
      FetchableNonceAndExpirationJsonRpcAdapter.instance =
        new FetchableNonceAndExpirationJsonRpcAdapter(settings, provider);
    }

    return FetchableNonceAndExpirationJsonRpcAdapter.instance;
  }

  public toggleNetworkContract(chain: Chain): Promise<KannaDynamicPriceSale> {
    if (this.settings.blockchain.current.layer === LayerType.L1) {
      return this.provider.dynamicSale();
    }

    if (this.settings.blockchain.current.layer === LayerType.L2) {
      if (chain.layer === LayerType.L1) {
        return this.provider.dynamicSale();
      }

      return this.provider.dynamicPolygonSale();
    }

    const message = `invalid chain: ${JSON.stringify(
      this.settings.blockchain.current || {},
    )}`;

    throw new Error(message);
  }

  async fetch(
    cryptoWallet: string,
    chain: Chain,
  ): Promise<NonceAndExpirationDto> {
    const contract = await this.toggleNetworkContract(chain);
    const [incrementalNonce, dueDate] = await contract.getNonceAndDueDate(
      cryptoWallet,
      120,
    );

    return {
      incrementalNonce: incrementalNonce.toString(),
      dueDate: dueDate.toString(),
    };
  }
}

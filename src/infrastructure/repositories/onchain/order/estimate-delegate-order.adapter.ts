import {ethers} from 'ethers';
import {type Chain} from '../../../../domain/common/entities/chain.entity';
import {LayerType} from '../../../../domain/common/enums/layer-type.enum';
import {type Settings} from '../../../../domain/common/settings';
import {type EstimateDelegateOrderDto} from '../../../../domain/order/dtos/estimate-delegate-order.dto';
import {type EstimateDelegateOrderPort} from '../../../../domain/order/ports/estimate-delegate-order.port';
import {type IKannaProtocolProvider} from '../kanna.provider';
import {type KannaDynamicPriceSale} from '../protocol/contracts';

export class EstimateDelegateOrderJsonRpcAdapter
implements EstimateDelegateOrderPort {
  static instance: EstimateDelegateOrderPort;

  private constructor(
		readonly settings: Settings,
		readonly provider: IKannaProtocolProvider,
  ) {}

  static getInstance(settings: Settings, provider: IKannaProtocolProvider) {
    if (!EstimateDelegateOrderJsonRpcAdapter.instance) {
      EstimateDelegateOrderJsonRpcAdapter.instance =
        new EstimateDelegateOrderJsonRpcAdapter(settings, provider);
    }

    return EstimateDelegateOrderJsonRpcAdapter.instance;
  }

  public async toggleNetworkContract(chain: Chain): Promise<KannaDynamicPriceSale> {
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

  async execute(payload: EstimateDelegateOrderDto): Promise<string> {
    const {chain} = payload;

    const contract = await this.toggleNetworkContract(chain);

    const {
      recipient,
      knnPriceInUSD,
      signature,
      incrementalNonce,
      dueDate,
      nonce,
      amountInKNN,
      amountInETH,
    } = payload;

    const estimate = await contract.estimateGas.buyTokens(
      recipient,
      knnPriceInUSD,
      signature,
      incrementalNonce,
      dueDate,
      nonce,
      amountInKNN,
      {
        value: amountInETH,
      },
    );

    EstimateDelegateOrderJsonRpcAdapter.setThreshold(estimate);

    return estimate.toString();
  }

  static setThreshold(estimate: ethers.BigNumber) {
    const gasLimitThreshold = ethers.BigNumber.from('10000');

    estimate.add(gasLimitThreshold);
  }
}

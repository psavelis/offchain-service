import {
  BigNumber,
  type ContractReceipt,
  type ContractTransaction,
} from 'ethers';
import { type Chain } from '../../../../domain/common/entities/chain.entity';
import { LayerType } from '../../../../domain/common/enums/layer-type.enum';
import { type Settings } from '../../../../domain/common/settings';
import { type CurrencyAmount } from '../../../../domain/price/value-objects/currency-amount.value-object';
import { type LockSupplyDto } from '../../../../domain/supply/dtos/lock-supply.dto';
import { type OnChainReceipt } from '../../../../domain/supply/dtos/onchain-receipt.dto';
import { type LockSupplyPort } from '../../../../domain/supply/ports/lock-supply.port';
import { type IKannaProtocolProvider } from '../kanna.provider';
import { type KannaDynamicPriceSale } from '../protocol/contracts';
import parseOnChainReceipt from './receipt.parser';

export class LockSupplyRpcAdapter implements LockSupplyPort {
  static instance: LockSupplyPort;

  private constructor(
    readonly settings: Settings,
    readonly provider: IKannaProtocolProvider,
  ) {}

  static getInstance(
    settings: Settings | Partial<Settings>,
    provider: IKannaProtocolProvider,
  ) {
    if (!LockSupplyRpcAdapter.instance) {
      LockSupplyRpcAdapter.instance = new LockSupplyRpcAdapter(
        settings as Settings,
        provider,
      );
    }

    return LockSupplyRpcAdapter.instance;
  }

  public async toggleNetworkContract(
    chain: Chain,
  ): Promise<KannaDynamicPriceSale> {
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

  async lock({ nonce, amount, chain }: LockSupplyDto): Promise<OnChainReceipt> {
    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    const currentContract: KannaDynamicPriceSale =
      await this.toggleNetworkContract(chain);

    const { gasPrice } = await currentContract.provider.getFeeData();

    const transaction: ContractTransaction = await currentContract.lockSupply(
      uint256Amount,
      uint256Nonce,
      {
        gasPrice,
      },
    );

    const receipt: ContractReceipt = await transaction.wait();

    return parseOnChainReceipt(transaction, receipt);
  }

  async verify({ nonce, amount, chain }: LockSupplyDto): Promise<void> {
    this.validate(nonce, amount);

    const currentContract: KannaDynamicPriceSale =
      await this.toggleNetworkContract(chain);

    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    await currentContract.estimateGas.lockSupply(uint256Amount, uint256Nonce);
  }

  private validate(nonce: number, amount: CurrencyAmount) {
    if (!nonce) {
      throw new Error('lock aborted. missing nonce');
    }

    if (amount.decimals !== 18) {
      throw new Error(
        `invalid decimals at nonce ${nonce}: ${JSON.stringify(
          amount,
        )} (amount must be uint256)`,
      );
    }
  }
}

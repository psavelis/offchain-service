import { BigNumber, ContractReceipt, ContractTransaction } from 'ethers';
import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../../../../../domain/price/value-objects/currency-amount.value-object';
import { LockSupplyDto } from '../../../../../domain/supply/dtos/lock-supply.dto';
import { OnChainReceipt } from '../../../../../domain/supply/dtos/onchain-receipt.dto';
import { LockSupplyPort } from '../../../../../domain/supply/ports/lock-supply.port';
import { IKannaProtocolProvider } from '../kanna.provider';
import { KannaPreSale } from '../protocol/contracts';
import parseOnChainReceipt from './receipt.parser';
import { Settings } from '../../../../../domain/common/settings';
import { LayerType } from '../../../../../domain/common/enums/layer-type.enum';

export class LockSupplyRpcAdapter implements LockSupplyPort {
  static instance: LockSupplyPort;

  private constructor(
    readonly settings: Settings,
    readonly provider: IKannaProtocolProvider,
  ) {}

  static getInstance(settings: Settings, provider: IKannaProtocolProvider) {
    if (!LockSupplyRpcAdapter.instance) {
      LockSupplyRpcAdapter.instance = new LockSupplyRpcAdapter(
        settings,
        provider,
      );
    }

    return LockSupplyRpcAdapter.instance;
  }

  private toggleNetworkContract(): Promise<KannaPreSale> {
    if (this.settings.blockchain.current.layer === LayerType.L1)
      return this.provider.sale();

    if (this.settings.blockchain.current.layer === LayerType.L2)
      return this.provider.polygonSale();

    const message = `invalid chain: ${JSON.stringify(
      this.settings.blockchain.current || {},
    )}`;

    throw new Error(message);
  }

  async lock({ nonce, amount }: LockSupplyDto): Promise<OnChainReceipt> {
    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    const currentContract: KannaPreSale = await this.toggleNetworkContract();

    const transaction: ContractTransaction = await currentContract.lockSupply(
      uint256Amount,
      uint256Nonce,
    );

    const receipt: ContractReceipt = await transaction.wait();

    return parseOnChainReceipt(transaction, receipt);
  }

  async verify({ nonce, amount }: LockSupplyDto): Promise<void> {
    this.validate(nonce, amount);

    const currentContract: KannaPreSale = await this.toggleNetworkContract();

    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    await currentContract.estimateGas.lockSupply(uint256Amount, uint256Nonce);
  }

  private validate(nonce: number, amount: CurrencyAmount<CurrencyIsoCode>) {
    if (!nonce) {
      throw new Error(`lock aborted. missing nonce`);
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

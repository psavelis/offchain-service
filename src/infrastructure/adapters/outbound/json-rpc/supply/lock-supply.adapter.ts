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

export class LockSupplyRpcAdapter implements LockSupplyPort {
  static instance: LockSupplyPort;

  private constructor(readonly provider: IKannaProtocolProvider) {}

  static getInstance(provider: IKannaProtocolProvider) {
    if (!LockSupplyRpcAdapter.instance) {
      LockSupplyRpcAdapter.instance = new LockSupplyRpcAdapter(provider);
    }

    return LockSupplyRpcAdapter.instance;
  }

  async lock({ nonce, amount }: LockSupplyDto): Promise<OnChainReceipt> {
    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    const polygonSale: KannaPreSale = await this.provider.polygonSale();

    const transaction: ContractTransaction = await polygonSale.lockSupply(
      uint256Amount,
      uint256Nonce,
    );

    const receipt: ContractReceipt = await transaction.wait();

    return parseOnChainReceipt(transaction, receipt);
  }

  async verify({ nonce, amount }: LockSupplyDto): Promise<void> {
    this.validate(nonce, amount);
    const polygonSale: KannaPreSale = await this.provider.polygonSale();

    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    await polygonSale.estimateGas.lockSupply(uint256Amount, uint256Nonce);
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

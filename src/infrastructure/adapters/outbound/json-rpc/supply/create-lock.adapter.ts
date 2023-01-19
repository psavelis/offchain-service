import { BigNumber, ContractReceipt, ContractTransaction } from 'ethers';
import { LockSupplyDto } from '../../../../../domain/supply/dtos/lock-supply.dto';
import { OnChainReceipt } from '../../../../../domain/supply/dtos/onchain-receipt.dto';
import { IKannaProtocolProvider } from '../kanna.provider';
import { KannaPreSale } from '../protocol';
import parseOnChainReceipt from './receipt.parser';

export class LockSupplyRpcAdapter implements LockSupplyPort {
  constructor(readonly provider: IKannaProtocolProvider) {}

  async lock({ nonce, amount }: LockSupplyDto): Promise<OnChainReceipt> {
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

    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    const presale: KannaPreSale = await this.provider.preSale();

    const transaction: ContractTransaction = await presale.lockSupply(
      uint256Amount,
      uint256Nonce,
    ); // TODO: review EIP-1559 (revisar priority fee)

    const receipt: ContractReceipt = await transaction.wait();

    return parseOnChainReceipt(transaction, receipt);
  }

  async estimate() {
    const presale: KannaPreSale = await this.provider.preSale();

    const response: BigNumber = await presale.estimateGas.lockSupply();
  }
}

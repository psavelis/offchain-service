import { BigNumber, ContractReceipt, ContractTransaction } from 'ethers';
import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../../../../../domain/price/value-objects/currency-amount.value-object';
import { ClaimSupplyDto } from '../../../../../domain/supply/dtos/claim-supply.dto';
import { OnChainReceipt } from '../../../../../domain/supply/dtos/onchain-receipt.dto';
import { ClaimSupplyPort } from '../../../../../domain/supply/ports/claim-supply.port';
import { IKannaProtocolProvider } from '../kanna.provider';
import { KannaPreSale } from '../protocol';
import parseOnChainReceipt from './receipt.parser';

export class ClaimSupplyRpcAdapter implements ClaimSupplyPort {
  constructor(readonly provider: IKannaProtocolProvider) {}

  async claim({
    onchainAddress,
    amount,
    nonce,
  }: ClaimSupplyDto): Promise<OnChainReceipt> {
    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    const presale: KannaPreSale = await this.provider.preSale();

    const transaction: ContractTransaction = await presale.claim(
      onchainAddress,
      uint256Amount,
      uint256Nonce,
      false, // TODO: TYPECHAIN atualizar
    );

    const receipt: ContractReceipt = await transaction.wait();

    return parseOnChainReceipt(transaction, receipt);
  }

  async verify({
    onchainAddress,
    amount,
    nonce,
  }: ClaimSupplyDto): Promise<void> {
    this.validate(nonce, amount);
    const presale: KannaPreSale = await this.provider.preSale();

    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    await presale.estimateGas.claim(
      onchainAddress,
      uint256Amount,
      uint256Nonce,
      false, // TODO: TYPECHAIN atualizar
    );
  }

  private validate(nonce: number, amount: CurrencyAmount<CurrencyIsoCode>) {
    if (!nonce) {
      throw new Error(`claim aborted. missing nonce`);
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

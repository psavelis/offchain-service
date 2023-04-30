import { BigNumber, ContractReceipt, ContractTransaction } from 'ethers';
import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../../../../../domain/price/value-objects/currency-amount.value-object';
import { ClaimSupplyDto } from '../../../../../domain/supply/dtos/claim-supply.dto';
import { OnChainReceipt } from '../../../../../domain/supply/dtos/onchain-receipt.dto';
import { ClaimSupplyPort } from '../../../../../domain/supply/ports/claim-supply.port';
import { IKannaProtocolProvider } from '../kanna.provider';
import { KannaPreSale } from '../protocol/contracts';
import parseOnChainReceipt from './receipt.parser';

export class ClaimSupplyRpcAdapter implements ClaimSupplyPort {
  static instance: ClaimSupplyPort;

  private constructor(readonly provider: IKannaProtocolProvider) {}

  static getInstance(provider: IKannaProtocolProvider) {
    if (!ClaimSupplyRpcAdapter.instance) {
      ClaimSupplyRpcAdapter.instance = new ClaimSupplyRpcAdapter(provider);
    }

    return ClaimSupplyRpcAdapter.instance;
  }

  async claim({
    onchainAddress,
    amount,
    nonce,
  }: ClaimSupplyDto): Promise<OnChainReceipt> {
    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    const polygonSale: KannaPreSale = await this.provider.polygonSale();

    const transaction: ContractTransaction = await polygonSale.claim(
      onchainAddress,
      uint256Amount,
      uint256Nonce,
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
    const polygonSale: KannaPreSale = await this.provider.polygonSale();

    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    await polygonSale.estimateGas.claim(
      onchainAddress,
      uint256Amount,
      uint256Nonce,
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

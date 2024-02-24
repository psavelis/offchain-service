import {
  BigNumber,
  type ContractReceipt,
  type ContractTransaction,
} from 'ethers';
import { type Chain } from '../../../../domain/common/entities/chain.entity';
import { LayerType } from '../../../../domain/common/enums/layer-type.enum';
import { type Settings } from '../../../../domain/common/settings';
import { type CurrencyAmount } from '../../../../domain/price/value-objects/currency-amount.value-object';
import { type ClaimSupplyDto } from '../../../../domain/supply/dtos/claim-supply.dto';
import { type OnChainReceipt } from '../../../../domain/supply/dtos/onchain-receipt.dto';
import { type ClaimSupplyPort } from '../../../../domain/supply/ports/claim-supply.port';
import { type IKannaProtocolProvider } from '../kanna.provider';
import { type KannaDynamicPriceSale } from '../protocol/contracts';
import parseOnChainReceipt from './receipt.parser';

export class ClaimSupplyRpcAdapter implements ClaimSupplyPort {
  static instance: ClaimSupplyPort;

  private constructor(
    readonly settings: Settings,
    readonly provider: IKannaProtocolProvider,
  ) {}

  static getInstance(settings: Settings, provider: IKannaProtocolProvider) {
    if (!ClaimSupplyRpcAdapter.instance) {
      ClaimSupplyRpcAdapter.instance = new ClaimSupplyRpcAdapter(
        settings,
        provider,
      );
    }

    return ClaimSupplyRpcAdapter.instance;
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

  async claim({
    onchainAddress,
    amount,
    nonce,
    chain,
  }: ClaimSupplyDto): Promise<OnChainReceipt> {
    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    const contract: KannaDynamicPriceSale = await this.toggleNetworkContract(
      chain,
    );

    const { gasPrice } = await contract.provider.getFeeData();

    const transaction: ContractTransaction = await contract.claim(
      onchainAddress,
      uint256Amount,
      uint256Nonce,
      {
        gasPrice,
      },
    );

    const receipt: ContractReceipt = await transaction.wait();

    return parseOnChainReceipt(transaction, receipt);
  }

  async verify({
    onchainAddress,
    amount,
    nonce,
    chain,
  }: ClaimSupplyDto): Promise<void> {
    this.validate(nonce, amount);
    const contract: KannaDynamicPriceSale = await this.toggleNetworkContract(
      chain,
    );

    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    await contract.estimateGas.claim(
      onchainAddress,
      uint256Amount,
      uint256Nonce,
    );
  }

  private validate(nonce: number, amount: CurrencyAmount) {
    if (!nonce) {
      throw new Error('claim aborted. missing nonce');
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

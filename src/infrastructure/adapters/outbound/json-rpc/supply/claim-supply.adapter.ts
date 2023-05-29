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
import { Settings } from 'src/domain/common/settings';
import { Chain } from 'src/domain/common/entities/chain.entity';
import { LayerType } from 'src/domain/common/enums/layer-type.enum';

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

  public toggleNetworkContract(chain: Chain): Promise<KannaPreSale> {
    if (this.settings.blockchain.current.layer === LayerType.L1) {
      return this.provider.sale();
    }

    if (this.settings.blockchain.current.layer === LayerType.L2) {
      if (chain.layer === LayerType.L1) {
        return this.provider.sale();
      }

      return this.provider.polygonSale();
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

    const contract: KannaPreSale = await this.toggleNetworkContract(chain);

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
    const contract: KannaPreSale = await this.toggleNetworkContract(chain);

    const uint256Amount = BigNumber.from(amount.unassignedNumber);
    const uint256Nonce = BigNumber.from(String(nonce));

    await contract.estimateGas.claim(
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

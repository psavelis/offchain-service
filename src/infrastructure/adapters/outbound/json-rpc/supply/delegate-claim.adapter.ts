import {
  SignaturePayload,
  SignaturePort,
  SignatureResult,
} from '../../../../../domain/common/ports/signature.port';
import { Order } from '../../../../../domain/order/entities/order.entity';
import { LoggablePort } from '../../../../../domain/common/ports/loggable.port';
import { ClaimLockedSupplyDto } from '../../../../../domain/supply/dtos/claim-locked-supply.dto';
import { DelegateClaimPort } from '../../../../../domain/supply/ports/delegate-claim.port';
import { IKannaProtocolProvider } from '../kanna.provider';
import { KannaPreSale } from '../protocol/contracts';
import { Settings } from '../../../../../domain/common/settings';
import { SignerType } from '../../../../../domain/common/enums/signer-type.enum';
import { Chain } from '../../../../../domain/common/entities/chain.entity';
import { LayerType } from '../../../../../domain/common/enums/layer-type.enum';
import { NetworkType } from '../../../../../domain/common/enums/network-type.enum';

const claimType =
  'Claim(address recipient,uint256 amountInKNN,uint256 ref,uint256 nonce)';

export class DelegateClaimRpcAdapter implements DelegateClaimPort {
  static instance: DelegateClaimPort;

  private constructor(
    readonly provider: IKannaProtocolProvider,
    readonly settings: Settings,
    readonly signaturePort: SignaturePort,
    readonly logger: LoggablePort,
  ) {}

  static getInstance(
    provider: IKannaProtocolProvider,
    settings: Settings,
    signaturePort: SignaturePort,
    logger: LoggablePort,
  ) {
    if (!DelegateClaimRpcAdapter.instance) {
      DelegateClaimRpcAdapter.instance = new DelegateClaimRpcAdapter(
        provider,
        settings,
        signaturePort,
        logger,
      );
    }

    return DelegateClaimRpcAdapter.instance;
  }

  async delegateClaimLocked(
    claimRequest: ClaimLockedSupplyDto,
    order: Order,
  ): Promise<SignatureResult> {
    if (!claimRequest.cryptoWallet) {
      throw new Error('[delegate-sign] crypto wallet cannot be empty');
    }

    const amountOfTokens = order.getAmountOfTokens();
    const paymentSequence = order.getPaymentSequence();

    if (
      amountOfTokens.decimals !== 18 ||
      !amountOfTokens.unassignedNumber?.trim()
    ) {
      throw new Error(
        `[delegate-sign] invalid amount of tokens ${JSON.stringify(
          amountOfTokens,
        )} for orderId ${order.getId()}`,
      );
    }

    if (!paymentSequence || Number(paymentSequence) <= 0) {
      throw new Error(
        `[delegate-sign] invalid paymentSequence #${paymentSequence} for orderId ${order.getId()}`,
      );
    }

    const claimTypeHash = this.signaturePort.hash(claimType);
    const payload: SignaturePayload = {
      types: ['bytes32', 'address', 'uint256', 'uint256'],
      values: [
        claimTypeHash,
        claimRequest.cryptoWallet,
        amountOfTokens.unassignedNumber,
        paymentSequence,
      ],
    };

    const chain = new Chain(order.getSettledChainId());

    const isLegacy = this.isLegacy(order, chain);

    const signature = await this.signaturePort.sign(
      payload,
      isLegacy ? SignerType.PreSaleClaimManager : SignerType.SaleClaimManager,
      chain,
    );

    this.logger.info(
      `Signature: ${order.getEndToEndId()} has been signed on ${
        NetworkType[chain.id]
      } ${chain.layer} referencing #${paymentSequence} issued by [${
        claimRequest.clientIp
      } @ ${claimRequest.clientAgent}]`,
    );

    return signature;
  }

  isLegacy(order: Order, chain: Chain) {
    if (chain.layer !== LayerType.L1) {
      return false;
    }

    const preSaleContract =
      this.settings.blockchain.ethereum.contracts.legacyPreSaleAddress;

    return order.getContractAddress() === preSaleContract;
  }

  async estimateClaimLocked(
    claimRequest: ClaimLockedSupplyDto,
    order: Order,
    signature: SignatureResult,
  ): Promise<void> {
    const chain = new Chain(order.getSettledChainId());

    const saleContract: KannaPreSale = this.isLegacy(order, chain)
      ? await this.provider.legacyPreSale()
      : chain.layer === LayerType.L2
      ? await this.provider.polygonSale()
      : await this.provider.sale();

    const paymentSequence = String(order.getPaymentSequence());

    await saleContract.estimateGas.claimLocked(
      claimRequest.cryptoWallet!,
      order.getAmountOfTokens().unassignedNumber,
      paymentSequence,
      signature.signature,
      signature.nonce,
    );

    this.logger.debug(
      `[estimate-sign][signature-verified] Order ${order.getId()} has been signed on ${
        NetworkType[chain.id]
      } ${chain.layer} referencing #${paymentSequence} issued by [${
        claimRequest.clientIp
      }] @ ${claimRequest.clientAgent}`,
    );
  }
}

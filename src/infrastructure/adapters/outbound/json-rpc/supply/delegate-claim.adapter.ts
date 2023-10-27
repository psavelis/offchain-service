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
import { KannaDynamicPriceSale, KannaPreSale } from '../protocol/contracts';
import { Settings } from '../../../../../domain/common/settings';
import { SignerType } from '../../../../../domain/common/enums/signer-type.enum';
import { Chain } from '../../../../../domain/common/entities/chain.entity';
import { LayerType } from '../../../../../domain/common/enums/layer-type.enum';
import { NetworkType } from '../../../../../domain/common/enums/network-type.enum';

const claimType =
  'Claim(address recipient,uint256 amountInKNN,uint256 ref,uint256 nonce)';

const claimTypeLayer2 =
  'Claim(address recipient,uint256 amountInKNN,uint256 ref,uint256 nonce,uint256 chainId)';

export class DelegateClaimRpcAdapter implements DelegateClaimPort {
  static instance: DelegateClaimRpcAdapter;
  private contractHashMap: Record<
    LayerType,
    Record<string, Promise<KannaPreSale | KannaDynamicPriceSale>>
  >;

  private signerHashMap: Record<LayerType, Record<string, SignerType>>;

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

      DelegateClaimRpcAdapter.instance.contractHashMap = {
        [LayerType.L1]: {
          [settings.blockchain.ethereum.contracts.legacyPreSaleAddress]:
            provider.legacyPreSale(),
          [settings.blockchain.ethereum.contracts.saleAddress]: provider.sale(),
          [settings.blockchain.ethereum.contracts.dynamicSaleAddress]:
            provider.dynamicSale(),
        },
        [LayerType.L2]: {
          [settings.blockchain.polygon.contracts.saleAddress]:
            provider.polygonSale(),
          [settings.blockchain.polygon.contracts.dynamicSaleAddress]:
            provider.dynamicPolygonSale(),
        },
      };

      DelegateClaimRpcAdapter.instance.signerHashMap = {
        [LayerType.L1]: {
          [settings.blockchain.ethereum.contracts.legacyPreSaleAddress]:
            SignerType.PreSaleClaimManager,
          [settings.blockchain.ethereum.contracts.saleAddress]:
            SignerType.SaleClaimManager,
          [settings.blockchain.ethereum.contracts.dynamicSaleAddress]:
            SignerType.DynamicSaleClaimManager,
        },
        [LayerType.L2]: {
          [settings.blockchain.polygon.contracts.saleAddress]:
            SignerType.SaleClaimManager,
          [settings.blockchain.polygon.contracts.dynamicSaleAddress]:
            SignerType.DynamicSaleClaimManager,
        },
      };
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

    const chain = new Chain(order.getSettledChainId());

    const claimTypeHash = this.signaturePort.hash(
      chain.layer === LayerType.L1 ? claimType : claimTypeLayer2,
    );

    const payload: SignaturePayload = {
      types: ['bytes32', 'address', 'uint256', 'uint256'],
      values: [
        claimTypeHash,
        claimRequest.cryptoWallet,
        amountOfTokens.unassignedNumber,
        paymentSequence,
      ],
    };

    const signer = this.signerHashMap[chain.layer][order.getContractAddress()];

    if (!signer) {
      const message = `No signer found for ContractAddress: ${order.getContractAddress()} on Layer: ${
        LayerType[chain.layer]
      }`;

      throw new Error(message);
    }

    const signature = await this.signaturePort.sign(payload, signer, chain);

    this.logger.info(
      `Signature: ${order.getEndToEndId()} has been signed on ${
        NetworkType[chain.id]
      } ${LayerType[chain.layer]} referencing #${paymentSequence} issued by [${
        claimRequest.clientIp
      } @ ${claimRequest.clientAgent}]`,
    );

    return signature;
  }

  public toggleNetworkContract(
    order: Order,
    chain: Chain,
  ): Promise<KannaPreSale | KannaDynamicPriceSale> {
    return this.contractHashMap[chain.layer][order.getContractAddress()];
  }

  async estimateClaimLocked(
    claimRequest: ClaimLockedSupplyDto,
    order: Order,
    signature: SignatureResult,
  ): Promise<void> {
    const chain = new Chain(order.getSettledChainId());

    const saleContract: KannaPreSale | KannaDynamicPriceSale =
      await this.toggleNetworkContract(order, chain);

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
      } ${LayerType[chain.layer]} referencing #${paymentSequence} issued by [${
        claimRequest.clientIp
      }] @ ${claimRequest.clientAgent}`,
    );
  }
}

import { BigNumber, ethers, type Wallet } from 'ethers';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import {
  VerificationPayload,
  type SignaturePayload,
  type SignaturePort,
  type SignatureResult,
} from '../../../../domain/common/ports/signature.port';

import { SiweMessage } from 'siwe';
import { DAPP_DOMAIN } from '../../../../domain/common/constants/domains.contants';
import { type Chain } from '../../../../domain/common/entities/chain.entity';
import { LayerType } from '../../../../domain/common/enums/layer-type.enum';
import { NetworkType } from '../../../../domain/common/enums/network-type.enum';
import { SignerType } from '../../../../domain/common/enums/signer-type.enum';
import { type Settings } from '../../../../domain/common/settings';

const contractOffset = BigNumber.from('1');

export class ECDSASignatureAdapter implements SignaturePort {
  static instance: SignaturePort;
  private readonly signers: Record<LayerType, Record<SignerType, Wallet>>;

  private constructor(readonly settings: Settings) {
    const ethereumProvider = new ethers.providers.JsonRpcProvider(
      settings.blockchain.ethereum.providerEndpoint,
    );

    const polygonProvider = new ethers.providers.JsonRpcProvider(
      settings.blockchain.polygon.providerEndpoint,
    );

    const layer1Signers = {
      [SignerType.PreSaleClaimManager]: new ethers.Wallet(
        settings.blockchain.ethereum.legacyPreSaleClaimSignerKey,
        ethereumProvider,
      ),

      [SignerType.SaleClaimManager]: new ethers.Wallet(
        settings.blockchain.ethereum.fixedSaleClaimsSignerKey,
        ethereumProvider,
      ),

      [SignerType.BadgesMinter]: new ethers.Wallet(
        settings.blockchain.ethereum.badgesMinterSignerKey,
        ethereumProvider,
      ),

      [SignerType.DynamicSaleClaimManager]: new ethers.Wallet(
        settings.blockchain.ethereum.dynamicSaleClaimsSignerKey,
        ethereumProvider,
      ),
    };

    const layer2Signers = {
      [SignerType.SaleClaimManager]: new ethers.Wallet(
        settings.blockchain.polygon.claimSignerKey,
        polygonProvider,
      ),

      [SignerType.BadgesMinter]: new ethers.Wallet(
        settings.blockchain.polygon.badgesMinterSignerKey,
        polygonProvider,
      ),

      // unavailable
      [SignerType.PreSaleClaimManager]: undefined,

      [SignerType.DynamicSaleClaimManager]: new ethers.Wallet(
        settings.blockchain.polygon.dynamicSaleClaimsSignerKey,
        polygonProvider,
      ),
    };

    this.signers = {
      [LayerType.L1]: layer1Signers,
      [LayerType.L2]: layer2Signers,
    };
  }

  static getInstance(settings: Settings) {
    if (!ECDSASignatureAdapter.instance) {
      ECDSASignatureAdapter.instance = new ECDSASignatureAdapter(settings);
    }

    return ECDSASignatureAdapter.instance;
  }

  async sign(
    payload: SignaturePayload,
    signerType: SignerType,
    chain: Chain,
  ): Promise<SignatureResult> {
    const hex32nonce = hexlify(randomBytes(32));

    const uint256Nonce = BigNumber.from(hex32nonce).sub(contractOffset);

    const types = [...payload.types, 'uint256'];
    const values = [...payload.values, uint256Nonce];

    if (chain.layer !== LayerType.L1) {
      types.push('uint256');
      values.push(String(chain.id));
    }

    const messageHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(types, values),
    );

    const signer = this.signers[chain.layer][signerType];

    if (!signer) {
      throw new Error(
        `Signer ${SignerType[signerType]} is not available on Layer ${
          LayerType[chain.layer]
        } (Network=${NetworkType[chain.id]}, ID=${chain.id})`,
      );
    }

    const signature = await signer.signMessage(
      ethers.utils.arrayify(messageHash),
    );

    return {
      signature,
      nonce: uint256Nonce.toString(),
      cryptoWallet: String(payload.values[1]),
      chain,
    };
  }

  hash(value: string) {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(value));
  }

  async verify(
    cryptoWallet: string,
    payload: VerificationPayload,
    signature: string,
  ): Promise<boolean> {
    const siweMessage = new SiweMessage({
      domain: DAPP_DOMAIN,
      address: payload.address,
      statement: payload.statement,
      uri: payload.uri,
      version: payload.version,
      chainId: payload.chainId,
      nonce: payload.nonce,
      issuedAt: payload.issuedAt,
    });

    const message = siweMessage.prepareMessage();

    const signerAddress = ethers.utils.verifyMessage(message, signature);

    if (signerAddress.toLowerCase() === cryptoWallet.toLowerCase()) {
      return true;
    }

    return false;
  }

  getRandomNonce(): string {
    return hexlify(randomBytes(32));
  }
}

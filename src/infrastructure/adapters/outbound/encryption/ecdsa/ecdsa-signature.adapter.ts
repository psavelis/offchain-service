import { BigNumber, ethers, Wallet } from 'ethers';
import { hexlify, randomBytes } from 'ethers/lib/utils';
import {
  SignaturePayload,
  SignaturePort,
  SignatureResult,
} from '../../../../../domain/common/ports/signature.port';

import { Settings } from '../../../../../domain/common/settings';

const contractOffset = BigNumber.from('1');

export class ECDSASignatureAdapter implements SignaturePort {
  static instance: SignaturePort;
  private legacySignerWallet: Wallet;
  private currentSignerWallet: Wallet;

  private constructor(readonly settings: Settings) {
    const provider = new ethers.providers.JsonRpcProvider(
      settings.blockchain.providerEndpoint,
    );

    this.legacySignerWallet = new ethers.Wallet(
      settings.blockchain.legacyClaimSignerKey,
      provider,
    );

    this.currentSignerWallet = new ethers.Wallet(
      settings.blockchain.currentClaimSignerKey,
      provider,
    );
  }

  static getInstance(settings: Settings) {
    if (!ECDSASignatureAdapter.instance) {
      ECDSASignatureAdapter.instance = new ECDSASignatureAdapter(settings);
    }

    return ECDSASignatureAdapter.instance;
  }

  async sign(
    payload: SignaturePayload,
    legacy: boolean,
  ): Promise<SignatureResult> {
    const hex32nonce = hexlify(randomBytes(32));

    const uint256Nonce = BigNumber.from(hex32nonce).sub(contractOffset);

    const types = [...payload.types, 'uint256'];
    const values = [...payload.values, uint256Nonce];

    const messageHash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(types, values),
    );

    const signer = legacy ? this.legacySignerWallet : this.currentSignerWallet;

    const signature = await signer.signMessage(
      ethers.utils.arrayify(messageHash),
    );

    return {
      signature,
      nonce: uint256Nonce.toString(),
      cryptoWallet: payload.values[1],
    };
  }

  hash(value: string) {
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(value));
  }
}

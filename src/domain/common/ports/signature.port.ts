import { Chain } from '../entities/chain.entity';
import { SignerType } from '../enums/signer-type.enum';

export interface SignaturePayload {
  types: Array<string>;
  values: Array<string>;
}

export interface SignatureResult {
  signature: string;
  nonce: string;
  cryptoWallet: string;
  chain: Chain;
}

export interface SignaturePort {
  sign(
    payload: SignaturePayload,
    signer: SignerType,
    chain: Chain,
  ): Promise<SignatureResult>;
  hash(value: string);
}

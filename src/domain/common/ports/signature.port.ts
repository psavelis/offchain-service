import { type Chain } from '../entities/chain.entity';
import { type SignerType } from '../enums/signer-type.enum';

export type SignaturePayload = {
  types: string[];
  values: Array<object | string>;
};

export type VerificationPayload = {
  issuedAt: string;
  nonce: string;
  chainId: number;
  version: string;
  uri: string;
  statement: string;
  address: string;
};

export type SignatureResult = {
  signature: string;
  nonce: string;
  cryptoWallet: string;
  chain: Chain;
};

export type SignaturePort = {
  sign(
    payload: SignaturePayload,
    signer: SignerType,
    chain: Chain,
  ): Promise<SignatureResult>;
  hash(value: string);
  verify(
    cryptoWallet: string,
    payload: object,
    signature: string,
  ): Promise<boolean>;
  getRandomNonce(): string;
};

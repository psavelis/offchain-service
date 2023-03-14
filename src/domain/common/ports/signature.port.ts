export interface SignaturePayload {
  types: Array<string>;
  values: Array<string>;
}

export interface SignatureResult {
  signature: string;
  nonce: string;
  cryptoWallet: string;
}

export interface SignaturePort {
  sign(payload: SignaturePayload, legacy: boolean): Promise<SignatureResult>;
  hash(value: string);
}

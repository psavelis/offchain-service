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
  sign(payload: SignaturePayload): Promise<SignatureResult>;
  hash(value: string);
}

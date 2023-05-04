export interface SignedMintResponseDto {
  cryptoWallet: string;
  signature: string;
  referenceMetadataId: number;
  nonce: string;
  incremental: number;
  amount: number;
}

export interface SignedMintResponseDto {
  cryptoWallet: string;
  signature: string;
  referenceMetadataId: number;
  nonce: string;
  incremental: number;
  dueDate: number;
  amount: number;
  switchChainsDate: Date;
  onHold: boolean;
}

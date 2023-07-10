export interface VerifyMintResponseDto {
  onHold: boolean;
  referenceMetadataId: number;
  isVerified: boolean;
  amount?: number;
  chainId: number;
  dueDate?: Date;
  switchChainsDate?: Date;
}

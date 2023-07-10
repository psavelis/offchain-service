import { SignedMintResponseDto } from '../dtos/signed-mint-response.dto';

export const FetchBadgeSignature = Symbol('FETCH_BADGE_SIGNATURE');

export interface FetchBadgeSignatureInteractor {
  execute: (
    cryptoWallet: string,
    clientIp: string,
    clientAgent: string,
    chainId?: number,
  ) => Promise<SignedMintResponseDto | undefined>;
}

import {type SignedMintResponseDto} from '../dtos/signed-mint-response.dto';

export const FetchBadgeSignature = Symbol('FETCH_BADGE_SIGNATURE');

export type FetchBadgeSignatureInteractor = {
	execute: (
		cryptoWallet: string,
		referenceMetadataId: number,
		clientIp: string,
		clientAgent: string,
		chainId?: number,
	) => Promise<SignedMintResponseDto | undefined>;
};

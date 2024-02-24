import {type AuthChallengeSignatureData} from './auth-challenge-signature-data.dto';

export type AuthChallengeResponseDto = {
	challengeId: string;
	signatureData: AuthChallengeSignatureData;
	grantType: string;
	network: string;
};

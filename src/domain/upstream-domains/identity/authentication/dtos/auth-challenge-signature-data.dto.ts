import {type NetworkType} from '../../../../common/enums/network-type.enum';

export type AuthChallengeSignatureData = {
	domain: string;
	address: string;
	statement: string;
	uri: string;
	version: string;
	chainId: NetworkType;
	nonce: string;
	issuedAt: string;
};

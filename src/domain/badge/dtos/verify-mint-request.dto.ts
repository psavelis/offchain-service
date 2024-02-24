import {type Chain} from 'src/domain/common/entities/chain.entity';

export type VerifyMintRequestDto = {
	cryptoWallet: string;
	chain: Chain;
	referenceMetadataId: number;
};

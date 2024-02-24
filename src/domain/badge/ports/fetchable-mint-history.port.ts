import {type MintHistory} from '../entities/mint-history.entity';

export type FetchableMintHistoryPort = {
	fetchLast(
		cryptoWallet: string,
		referenceMetadataId: number,
	): Promise<MintHistory | undefined>;
};

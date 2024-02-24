import {type MintHistory} from '../entities/mint-history.entity';

export type PersistableMintHistoryPort = {
	create(mintHistory: MintHistory): Promise<void>;
};

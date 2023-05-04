import { MintHistory } from '../entities/mint-history.entity';

export interface PersistableMintHistoryPort {
  create(mintHistory: MintHistory): Promise<void>;
}

import { MintHistory } from '../entities/mint-history.entity';

export interface FetchableMintHistoryPort {
  fetchLast(
    cryptoWallet: string,
    referenceMetadataId: number,
  ): Promise<MintHistory | undefined>;
}

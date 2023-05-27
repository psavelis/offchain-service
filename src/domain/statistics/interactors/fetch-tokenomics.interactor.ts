import { TokenomicsDto } from '../dtos/tokenomics.dto';

export const FetchTokenomics = Symbol('FETCH_TOKENOMICS');
export interface FetchTokenomicsInteractor {
  execute(): Promise<TokenomicsDto>;
}

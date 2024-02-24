import {type TokenomicsDto} from '../dtos/tokenomics.dto';

export const FetchTokenomics = Symbol('FETCH_TOKENOMICS');
export type FetchTokenomicsInteractor = {
	execute(): Promise<TokenomicsDto>;
};

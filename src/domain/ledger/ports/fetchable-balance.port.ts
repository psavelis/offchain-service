import {type Balance} from '../entities/balance.entity';

export type FetchableBalancePort = {
	fetch(account: string): Promise<Balance | undefined>;
};

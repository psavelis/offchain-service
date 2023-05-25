import { Balance } from '../entities/balance.entity';

export interface FetchableBalancePort {
  fetch(account: string): Promise<Balance | undefined>;
}

import { type Chain } from '../../common/entities/chain.entity';
import { type CurrencyAmount } from '../../price/value-objects/currency-amount.value-object';

export type LockSupplyDto = {
  chain: Chain;
  nonce: number;
  amount: CurrencyAmount;
};

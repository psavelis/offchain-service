import { Chain } from '../../common/entities/chain.entity';
import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../../price/value-objects/currency-amount.value-object';

export interface LockSupplyDto {
  chain: Chain;
  nonce: number;
  amount: CurrencyAmount<CurrencyIsoCode>;
}

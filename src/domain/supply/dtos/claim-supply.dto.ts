import { Chain } from 'src/domain/common/entities/chain.entity';
import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../../price/value-objects/currency-amount.value-object';

export interface ClaimSupplyDto {
  nonce: number;
  onchainAddress: string;
  amount: CurrencyAmount<CurrencyIsoCode>;
  chain: Chain;
}

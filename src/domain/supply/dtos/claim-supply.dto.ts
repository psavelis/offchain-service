import { type Chain } from 'src/domain/common/entities/chain.entity';
import { type CurrencyAmount } from '../../price/value-objects/currency-amount.value-object';

export type ClaimSupplyDto = {
  nonce: number;
  onchainAddress: string;
  amount: CurrencyAmount;
  chain: Chain;
};

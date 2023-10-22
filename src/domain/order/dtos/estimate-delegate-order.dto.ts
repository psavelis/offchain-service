import { Chain } from '../../common/entities/chain.entity';
import { QuotationAggregate } from '../../price/value-objects/quotation-aggregate.value-object';

export interface EstimateDelegateOrderDto {
  recipient: string;
  knnPriceInUSD: string;
  incrementalNonce: string;
  dueDate: string;
  amountInETH: string;
  amountInKNN: string;
  nonce: string;
  signature: string;
  chain: Chain;
}

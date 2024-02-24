import { type Chain } from '../../common/entities/chain.entity';

export type EstimateDelegateOrderDto = {
  recipient: string;
  knnPriceInUSD: string;
  incrementalNonce: string;
  dueDate: string;
  amountInETH: string;
  amountInKNN: string;
  nonce: string;
  signature: string;
  chain: Chain;
};

import { SignatureResult } from '../../common/ports/signature.port';
import { Order, OrderStatus } from '../../order/entities/order.entity';
import { CurrencyAmount } from '../../price/value-objects/currency-amount.value-object';

export interface SignedClaim {
  order: Order;
  signature: SignatureResult;
}

export interface MinimalSignedClaim {
  order: {
    orderId: string;
    status: OrderStatus | undefined;
    statusDescription: string;
    total: number;
    amountOfTokens: CurrencyAmount<'BRL' | 'ETH' | 'KNN' | 'USD' | 'MATIC'>;
    lockTransactionHash: string;
    reference: number | undefined;
    createdAt: Date;
  };
  signature: SignatureResult;
}

import {type SignatureResult} from '../../common/ports/signature.port';
import {type Order, type OrderStatus} from '../../order/entities/order.entity';
import {type CurrencyAmount} from '../../price/value-objects/currency-amount.value-object';

export type SignedClaim = {
	order: Order;
	signature: SignatureResult;
};

export type MinimalSignedClaim = {
	order: {
		orderId: string;
		status: OrderStatus | undefined;
		statusDescription: string;
		total: number;
		amountOfTokens: CurrencyAmount;
		lockTransactionHash: string;
		reference: number | undefined;
		createdAt: Date;
	};
	signature: SignatureResult;
};

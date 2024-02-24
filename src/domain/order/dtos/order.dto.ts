import {type OrderStatus, type UserIdentifier} from '../entities/order.entity';

export type OrderDto = {
	orderId: string;
	total: number;
	status: OrderStatus;
	statusDescription: string;
	expired: boolean;
	expiration: Date;
	identifierType: UserIdentifier;
	lockTransactionHash: string;
	claimTransactionHash: string;
	chainId: number;
};

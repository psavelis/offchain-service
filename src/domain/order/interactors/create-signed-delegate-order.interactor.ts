import {type CreateQuoteWithWallet} from '../dtos/create-quote-with-wallet.dto';
import {type DelegateOrderDto} from '../dtos/delegate-order.dto';

export const CreateSignedDelegateOrder = Symbol('CREATE_SIGNED_DELEGATE_ORDER');

export type CreateSignedDelegateOrderInteractor = {
	execute(
		createQuoteWithWallet: CreateQuoteWithWallet,
	): Promise<DelegateOrderDto>;
};

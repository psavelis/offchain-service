import { CreateQuoteWithWallet } from '../dtos/create-quote-with-wallet.dto';
import { DelegateOrderDto } from '../dtos/delegate-order.dto';

export const CreateSignedDelegateOrder = Symbol('CREATE_SIGNED_DELEGATE_ORDER');

export interface CreateSignedDelegateOrderInteractor {
  execute(
    createQuoteWithWallet: CreateQuoteWithWallet,
  ): Promise<DelegateOrderDto>;
}

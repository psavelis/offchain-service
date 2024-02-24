import {type SignatureResult} from '../../common/ports/signature.port';
import {type Order} from '../../order/entities/order.entity';
import {type ClaimLockedSupplyDto} from '../dtos/claim-locked-supply.dto';

export type DelegateClaimPort = {
	delegateClaimLocked(
		claimRequest: ClaimLockedSupplyDto,
		order: Order,
	): Promise<SignatureResult>;

	estimateClaimLocked(
		claimRequest: ClaimLockedSupplyDto,
		order: Order,
		signature: SignatureResult,
	): Promise<void>;
};

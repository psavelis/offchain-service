import { Chain } from 'src/domain/common/entities/chain.entity';
import { SignatureResult } from '../../common/ports/signature.port';
import { Order } from '../../order/entities/order.entity';
import { ClaimLockedSupplyDto } from '../dtos/claim-locked-supply.dto';

export interface DelegateClaimPort {
  delegateClaimLocked(
    claimRequest: ClaimLockedSupplyDto,
    order: Order,
  ): Promise<SignatureResult>;

  estimateClaimLocked(
    claimRequest: ClaimLockedSupplyDto,
    order: Order,
    signature: SignatureResult,
  ): Promise<void>;
}

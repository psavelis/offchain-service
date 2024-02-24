import {type Claim} from '../../../../domain/supply/entities/claim.entity';

export const parseEntity = (claim: Claim) => {
  return {
    payment_id: claim.getPaymentId(),
    onchain_address: claim.getOnchainAddress(),
    order_id: claim.getOrderId(),
    uint256_amount: claim.getUint256Amount(),
    id: claim.getId(),
    created_at: claim.getCreatedAt(),
    transaction_hash: claim.getTransactionHash(),
    updated_at: claim.getUpdatedAt(),
  };
};

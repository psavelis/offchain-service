import { LockEntity } from '../../../../../domain/supply/entities/lock.entity';

export const parseEntity = (lock: LockEntity) => {
  return {
    payment_id: lock.getPaymentId(),
    offchain_address: lock.getOffchainAddress(),
    order_id: lock.getOrderId(),
    uint256_amount: lock.getUint256Amount(),
    id: lock.getId(),
    created_at: lock.getCreatedAt(),
    transaction_hash: lock.getTransactionHash(),
    updated_at: lock.getUpdatedAt(),
  };
};

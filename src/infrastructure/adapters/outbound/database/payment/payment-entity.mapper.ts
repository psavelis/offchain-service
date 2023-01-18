import { Payment } from '../../../../../domain/payment/entities/payment.entity';

export const parseEntity = (payment: Payment) => {
  return {
    id: payment.getId(),
    order_id: payment.getOrderId(),
    clearing_id: payment.getClearingId(),
    provider_id: payment.getProviderId(),
    provider_timestamp: payment.getProviderTimestamp(),
    effective_date: payment.getEffectiveDate(),
    total: payment.getTotal(),
    created_at: payment.getCreatedAt(),
  };
};

import { Order } from '../../../../../domain/order/entities/order.entity';

export const parseEntity = (order: Order) => {
  return {
    amount_of_tokens: order.getAmountOfTokens(),
    client_agent: order.getClientAgent(),
    client_ip: order.getClientIp(),
    end_to_end_id: order.getEndToEndId(),
    expires_at: order.getExpiresAt(),
    created_at: order.getCreatedAt(),
    id: order.getId(),
    identifier_type: order.getIdentifierType(),
    iso_code: order.getIsoCode(),
    parent_id: order.getParentId(),
    payment_option: order.getPaymentOption(),
    status: order.getStatus(),
    total: order.getTotal(),
    user_identifier: order.getUserIdentifier(),
    total_gas: order.getTotalGas(),
    total_knn: order.getTotalKnn(),
    total_net: order.getTotalNet(),
    desired_chain_id: order.getDesiredChainId(),
  };
};

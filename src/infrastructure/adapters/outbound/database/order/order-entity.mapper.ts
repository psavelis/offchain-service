import { Order } from '../../../../../domain/order/entities/order.entity';

export const parseRow = (row: any) => {
  return new Order(
    {
      amountOfTokens: row.amount_of_tokens,
      clientAgent: row.client_agent,
      clientIp: row.client_ip,
      endToEndId: row.end_to_end_id,
      expiresAt: row.expires_at,
      identifierType: row.identifier_type,
      isoCode: row.iso_code,
      parentId: row.parent_id,
      paymentOption: row.payment_option,
      status: row.status,
      total: row.total,
      userIdentifier: row.user_identifier,
    },
    row.id,
  );
};

export const parseEntity = (order: Order) => {
  return {
    amount_of_tokens: order.getAmountOfTokens(),
    client_agent: order.getClientAgent(),
    client_ip: order.getClientIp(),
    end_to_end_id: order.getEndToEndId(),
    expires_at: order.getExpiresAt(),
    id: order.getId(),
    identifier_type: order.getIdentifierType(),
    iso_code: order.getIsoCode(),
    parent_id: order.getParentId(),
    payment_option: order.getPaymentOption(),
    status: order.getStatus(),
    total: order.getTotal(),
    user_identifier: order.getUserIdentifier(),
  };
};

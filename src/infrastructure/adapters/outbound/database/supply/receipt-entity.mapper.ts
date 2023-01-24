import { Receipt } from '../../../../../domain/supply/entities/receipt.entity';

export const parseEntity = (receipt: Receipt) => {
  return {
    id: receipt.getId(),
    chain_id: receipt.getChainId(),
    block_number: receipt.getBlockNumber(),
    transaction_hash: receipt.getTransactionHash(),
    order_id: receipt.getOrderId(),
    from: receipt.getFrom(),
    to: receipt.getTo(),
    gas_used: receipt.getGasUsed(),
    cumulative_gas_used: receipt.getCumulativeGasUsed(),
    effective_gas_price: receipt.getEffectiveGasPrice(),
    max_priority_fee_per_gas: receipt.getMaxPriorityFeePerGas(),
    max_fee_per_gas: receipt.getMaxFeePerGas(),
    created_at: receipt.getCreatedAt(),
  };
};

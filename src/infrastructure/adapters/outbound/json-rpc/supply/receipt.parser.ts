import { ContractReceipt, ContractTransaction } from 'ethers';
import { OnChainReceipt } from '../../../../../domain/supply/dtos/onchain-receipt.dto';

export default function parseOnChainReceipt(
  transaction: ContractTransaction,
  receipt: ContractReceipt,
): OnChainReceipt {
  return {
    transactionHash: receipt.transactionHash,
    blockNumber: receipt.blockNumber,
    from: receipt.from,
    to: receipt.to,
    chainId: transaction.chainId,
    gasUsed: Number(receipt.gasUsed),
    cumulativeGasUsed: Number(receipt.cumulativeGasUsed),
    effectiveGasPrice: Number(receipt.effectiveGasPrice),
    maxPriorityFeePerGas: Number(transaction.maxPriorityFeePerGas),
    maxFeePerGas: Number(transaction.maxFeePerGas),
  };
}

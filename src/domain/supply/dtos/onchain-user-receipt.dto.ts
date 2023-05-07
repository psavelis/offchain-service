import { NetworkType } from '../../common/enums/network-type.enum';

export interface OnChainUserReceipt {
  chainId: NetworkType;
  cryptoWallet: string;
  paymentSequence: number;
  amountInKnn: number;
  blockNumber: number;
  transactionHash: string;
  from: string;
  to: string;
  gasUsed: number;
  cumulativeGasUsed: number;
  effectiveGasPrice: number;
  pastDue?: Date;
  uint256Amount?: string;
}

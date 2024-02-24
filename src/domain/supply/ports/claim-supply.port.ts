import { type ClaimSupplyDto } from '../dtos/claim-supply.dto';
import { type OnChainReceipt } from '../dtos/onchain-receipt.dto';

export type ClaimSupplyPort = {
  claim({
    onchainAddress,
    amount,
    nonce,
  }: ClaimSupplyDto): Promise<OnChainReceipt>;

  verify({ onchainAddress, amount, nonce }: ClaimSupplyDto): Promise<void>;
};

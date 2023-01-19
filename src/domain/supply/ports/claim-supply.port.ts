import { ClaimSupplyDto } from '../dtos/claim-supply.dto';
import { OnChainReceipt } from '../dtos/onchain-receipt.dto';

export interface ClaimSupplyPort {
  claim({
    onchainAddress,
    amount,
    nonce,
  }: ClaimSupplyDto): Promise<OnChainReceipt>;

  verify({ onchainAddress, amount, nonce }: ClaimSupplyDto): Promise<void>;
}

import { Chain } from 'src/domain/common/entities/chain.entity';

export interface VerifyMintRequestDto {
  cryptoWallet: string;
  chain: Chain;
}

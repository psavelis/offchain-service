import { VerifyMintRequestDto } from '../dtos/verify-mint-request.dto';
import { VerifyMintResponseDto } from '../dtos/verify-mint-response.dto';

export interface VerifyMintInteractor {
  execute(entry: VerifyMintRequestDto): Promise<VerifyMintResponseDto>;
}

import { SignMintRequestDto } from '../dtos/sign-mint-request.dto';
import { SignedMintResponseDto } from '../dtos/signed-mint-response.dto';

export interface SignMintInteractor {
  execute: (request: SignMintRequestDto) => Promise<SignedMintResponseDto>;
}

import {type VerifyMintRequestDto} from '../dtos/verify-mint-request.dto';
import {type VerifyMintResponseDto} from '../dtos/verify-mint-response.dto';

export const VerifyMint = Symbol('VERIFY_MINT');

export type VerifyMintInteractor = {
	execute(entry: VerifyMintRequestDto): Promise<VerifyMintResponseDto>;
};

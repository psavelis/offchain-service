import {type SignMintRequestDto} from '../dtos/sign-mint-request.dto';
import {type SignedMintResponseDto} from '../dtos/signed-mint-response.dto';

export const SignMint = Symbol('SIGN_MINT');

export type SignMintInteractor = {
	execute: (request: SignMintRequestDto) => Promise<SignedMintResponseDto>;
};

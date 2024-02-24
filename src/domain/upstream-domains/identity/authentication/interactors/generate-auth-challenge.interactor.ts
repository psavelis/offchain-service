import {type AuthChallengeResponseDto} from '../dtos/auth-challenge-response.dto';
import {type CreateAuthChallengeDto} from '../dtos/create-auth-challenge.dto';

export const GenerateAuthChallenge = Symbol('GENERATE_AUTH_CHALLENGE');

export type GenerateAuthChallengeInteractor = {
	execute(
		request: CreateAuthChallengeDto,
	): Promise<AuthChallengeResponseDto | []>;
};

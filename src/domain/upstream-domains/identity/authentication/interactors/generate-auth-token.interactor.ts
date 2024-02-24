import { type GenerateTokenRequestDto as GenerateAuthTokenRequestDto } from '../dtos/generate-token-request.dto';

export const GenerateAuthToken = Symbol('GENERATE_AUTH_TOKEN');
export type GenerateAuthTokenInteractor = {
  execute(request: GenerateAuthTokenRequestDto): Promise<object | []>;
};

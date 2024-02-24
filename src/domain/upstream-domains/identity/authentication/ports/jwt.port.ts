import type jwt from 'jsonwebtoken';
import { type TokenPayload } from '../../../../common/dtos/token-payload.dto';

export type JwtPort = {
  sign(payload: TokenPayload, options?: jwt.SignOptions): Promise<string>;
  verify(token: string): Promise<TokenPayload>;
};

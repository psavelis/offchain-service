import { TokenPayload } from '../../../../common/dtos/token-payload.dto';

export class ForbiddenError extends Error {
  constructor(
    public readonly message: string,
    public readonly token?: TokenPayload,
    public readonly args?: object,
  ) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

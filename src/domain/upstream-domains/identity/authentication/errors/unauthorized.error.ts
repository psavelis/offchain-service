import { TokenPayload } from '../../../../common/dtos/token-payload.dto';
import { AuthRoleConstraint } from '../../authorization/value-objects/authorization-constraint.value-object';
import { RoleType } from '../enums/role-type.enum';

export class UnauthorizedError extends Error {
  constructor(
    public readonly message: string,
    public readonly token?: TokenPayload,
    public readonly roleConstraint?: AuthRoleConstraint<RoleType>,
    public readonly args?: object,
  ) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

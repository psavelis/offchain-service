import { AuthRoleConstraint } from '../../authorization/value-objects/authorization-constraint.value-object';
import { AuthTokenValidationResultDto } from '../dtos/auth-token-validation-result.dto';
import { RoleType } from '../enums/role-type.enum';

export const ValidateAuthToken = Symbol('VALIDATE_AUTH_TOKEN');
export type ValidateAuthTokenInteractor = {
  execute(
    token: string,
    roles: AuthRoleConstraint<RoleType>,
    requestResourceArgs?: object,
  ): Promise<AuthTokenValidationResultDto>;
};

import { TokenPayload } from '../../../../common/dtos/token-payload.dto';
import { LoggablePort } from '../../../../common/ports/loggable.port';
import { AuthTokenValidationResultDto } from '../../authentication/dtos/auth-token-validation-result.dto';
import { RoleType } from '../../authentication/enums/role-type.enum';
import { UnauthorizedError } from '../../authentication/errors/unauthorized.error';
import { ValidateAuthTokenInteractor } from '../../authentication/interactors/validate-auth-token.interactor';
import { JwtPort } from '../../authentication/ports/jwt.port';
import { ForbiddenError } from '../errors/forbidden.error';
import { AuthRoleConstraint } from '../value-objects/authorization-constraint.value-object';

export class ValidateAuthTokenUseCase implements ValidateAuthTokenInteractor {
  constructor(readonly logger: LoggablePort, readonly jwtPort: JwtPort) {}

  async execute(
    token: string,
    roleConstraint: AuthRoleConstraint<RoleType>,
    requestResourceArgs?: object,
  ): Promise<AuthTokenValidationResultDto> {
    try {
      const decodedToken = await this.jwtPort.verify(token);
      const userRoles: RoleType[] | undefined = decodedToken.roles;

      if (!userRoles || userRoles.length === 0) {
        throw new UnauthorizedError(
          'Token does not contain any roles.',
          decodedToken,
          requestResourceArgs,
        );
      }

      for (const constraint of Object.keys(roleConstraint) as Array<
        keyof AuthRoleConstraint<RoleType>
      >) {
        if (
          !constraint ||
          !roleConstraint[constraint] ||
          roleConstraint[constraint]?.length === 0
        ) {
          continue;
        }

        this[constraint](
          roleConstraint,
          userRoles,
          decodedToken,
          requestResourceArgs,
        );
      }

      return { valid: true, message: 'Token is valid' };
    } catch (error) {
      return { valid: false, message: 'Token validation failed.' };
    }
  }

  private XOR(
    roleConstraint: AuthRoleConstraint<RoleType>,
    userRoles: RoleType[],
    decodedToken: TokenPayload,
    requestResourceArgs: object | undefined,
  ) {
    if (roleConstraint.XOR && Array.isArray(roleConstraint.XOR)) {
      const xorRolesCount = roleConstraint.XOR.filter((role) =>
        userRoles.includes(role),
      ).length;

      if (xorRolesCount !== 1) {
        throw new ForbiddenError(
          'Token does not meet the EXCLUSIVE role requirement. [XOR constraint not met]',
          decodedToken,
          requestResourceArgs,
        );
      }
    }
  }

  private OR(
    roleConstraint: AuthRoleConstraint<RoleType>,
    userRoles: RoleType[],
    decodedToken: TokenPayload,
    requestResourceArgs: object | undefined,
  ) {
    if (
      roleConstraint.OR &&
      Array.isArray(roleConstraint.OR) &&
      !roleConstraint.OR.some((role) => userRoles.includes(role))
    ) {
      throw new ForbiddenError(
        'Token does not meet ANY of the optional roles. [OR constraint not met]',
        decodedToken,
        requestResourceArgs,
      );
    }
  }

  private EQ(
    roleConstraint: AuthRoleConstraint<RoleType>,
    userRoles: RoleType[],
    decodedToken: TokenPayload,
    requestResourceArgs: object | undefined,
  ) {
    if (
      roleConstraint.EQ &&
      Array.isArray(roleConstraint.XOR) &&
      !roleConstraint.EQ.every((role) => userRoles.includes(role))
    ) {
      throw new ForbiddenError(
        'Token does not meet the required role. [Equality constraint not met]',
        decodedToken,
        requestResourceArgs,
      );
    }
  }
}

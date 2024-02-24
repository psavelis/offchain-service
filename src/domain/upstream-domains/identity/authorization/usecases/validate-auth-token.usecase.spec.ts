import {
  AUTH_DOMAIN,
  DAPP_DOMAIN,
} from '../../../../common/constants/domains.contants';
import { TokenPayload } from '../../../../common/dtos/token-payload.dto';
import { NetworkType } from '../../../../common/enums/network-type.enum';
import { LoggablePort } from '../../../../common/ports/loggable.port';
import { RoleType } from '../../authentication/enums/role-type.enum';
import { JwtPort } from '../../authentication/ports/jwt.port';
import { ForbiddenError } from '../../authorization/errors/forbidden.error';
import { ValidateAuthTokenUseCase } from './validate-auth-token.usecase';

// Mock dependencies
const mockLogger: LoggablePort = {
  error: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
};

const mockJwtPort: JwtPort = {
  verify: jest.fn(),
  sign: jest.fn(),
};

const validToken = 'valid.token.string';
const invalidToken = 'invalid.token.string';

const tokenMocks: Partial<Record<RoleType, TokenPayload>> = {
  [RoleType.ADMIN]: {
    roles: [RoleType.ADMIN],
  },
  [RoleType.HOLDER]: {
    id: 'jwtid',
    roles: [RoleType.HOLDER],
    sub: 'encryptedIdentifier',
    iss: AUTH_DOMAIN,
    aud: DAPP_DOMAIN,
    iat: undefined,
    exp: undefined,
    nbf: undefined,
    chainId: String(NetworkType.Ethereum),
    scopes: undefined,
  },
  [RoleType.IMPACT_CULTIVATION_VALIDATOR]: {
    roles: [RoleType.IMPACT_CULTIVATION_VALIDATOR],
  },
  [RoleType.IMPACT_CULTIVATION_PRODUCER]: {
    roles: [RoleType.IMPACT_CULTIVATION_PRODUCER],
  },
  [RoleType.IMPACT_CULTIVATION_WORKFLOW_WEBHOOK]: {
    sub: undefined,
    aud: undefined,
    iss: undefined,
    iat: undefined,
    exp: undefined,
    nbf: undefined,
    chainId: undefined,
    roles: undefined,
    scopes: undefined,
  },
};
const validatorToken = {
  roles: [RoleType.IMPACT_CULTIVATION_VALIDATOR],
};

const roleConstraint = {
  XOR: [RoleType.Admin, RoleType.User],
};

describe('ValidateAuthTokenUseCase', () => {
  let useCase: ValidateAuthTokenUseCase;

  beforeEach(() => {
    useCase = new ValidateAuthTokenUseCase(mockLogger, mockJwtPort);
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should validate a token with correct XOR role constraint', async () => {
      mockJwtPort.verify.mockResolvedValueOnce(tokenPayload);

      const result = await useCase.execute(validToken, roleConstraint);

      expect(result).toEqual({ valid: true, message: 'Token is valid' });
      expect(mockJwtPort.verify).toHaveBeenCalledWith(validToken);
    });

    it('should throw UnauthorizedError if token has no roles', async () => {
      mockJwtPort.verify.mockResolvedValueOnce({ roles: [] });

      await expect(useCase.execute(validToken, roleConstraint)).rejects.toThrow(
        UnauthorizedError,
      );
    });

    it('should throw ForbiddenError if XOR role constraint is not met', async () => {
      mockJwtPort.verify.mockResolvedValueOnce({
        roles: [RoleType.Admin, RoleType.User],
      });

      await expect(useCase.execute(validToken, roleConstraint)).rejects.toThrow(
        ForbiddenError,
      );
    });

    // Add more tests for OR, EQ, and other scenarios...
  });

  // Add tests for private methods XOR, OR, EQ...
});

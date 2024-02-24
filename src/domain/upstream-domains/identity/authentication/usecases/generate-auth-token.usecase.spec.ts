import { Settings } from '../../../../common/settings';
import { GenerateTokenRequestDto } from '../dtos/generate-token-request.dto';
import { GrantType } from '../enums/grant-type.enum';
import {
  ImpactfulCultivationResourceEnum,
  ResourceCategoryEnum,
} from '../enums/resource-category.enum';
import { RoleType } from '../enums/role-type.enum';
import { ScopeType } from '../enums/scope-type.enum';
import { GenerateAuthTokenUseCase } from './generate-auth-token.usecase';

describe('GenerateTokenUsecase', () => {
  let useCase: GenerateAuthTokenUseCase;
  let mockSettings: any;
  let mockEncryptionPort: any;
  let mockFetchableAuthChallengePort: any;
  let mockSignaturePort: any;
  let mockPersistableAccessTokenPort: any;
  let mockFetchableRolePort: any;
  let mockJwtPort: any;
  let mockLogger: any;
  const maxFailures = 5;

  beforeEach(() => {
    process.env.ALLOW_DEBUG_PROD = 'true';
    mockSettings = {
      cbc: { key: 'testKey' },
    } as Settings;
    mockEncryptionPort = {
      encrypt: jest.fn().mockResolvedValue('encryptedClientId'),
    } as any;
    mockSignaturePort = {
      getRandomNonce: jest.fn().mockReturnValue('randomNonce'),
      hash: jest.fn().mockReturnValue('hashedType'),
      verify: jest.fn().mockResolvedValue(true),
    } as any;
    mockLogger = {
      error: jest.fn(),
      warning: jest.fn(),
    } as any;

    mockFetchableAuthChallengePort = {
      findByChallengeId: jest.fn().mockResolvedValue(null),
    } as any;

    useCase = new GenerateAuthTokenUseCase(
      mockSettings,
      mockEncryptionPort,
      mockFetchableAuthChallengePort,
      mockSignaturePort,
      mockPersistableAccessTokenPort,
      mockFetchableRolePort,
      mockJwtPort,
      mockLogger,
    );
  });

  it('should ban IP after consecutive failed attempts', async () => {
    const request: any = {
      clientId: '0x123',
      chainId: 1,
      scope: 'read:write',
      clientIp: '127.0.0.1',
      clientAgent: 'test-agent',
    };

    for (let i = 0; i < maxFailures; i++) {
      await useCase.execute(request).catch(() => {});
    }

    await useCase.execute(request);

    expect(useCase.isBannedIP(request.clientIp)).toBe(true);
  });

  it('should not process token generation for banned IP', async () => {
    const bannedIP = '192.168.1.1';

    useCase.setBannedIP(bannedIP);

    jest.useFakeTimers();
    jest.setSystemTime(
      new Date((useCase as any).bannedIPs[bannedIP]).getTime() - 1,
    );

    const request: any = {
      clientId: '0x456',
      chainId: 2,
      scope: 'read:write',
      clientIp: bannedIP,
      clientAgent: 'test-agent-2',
      grantType: GrantType.EIP4361,
    };

    const response = await useCase.execute(request);

    const expectedError = `[${request.clientId}@${request.clientIp}:${
      request.clientAgent
    }] credential rejection: undefined (banned ip, due: ${new Date(
      (useCase as any).bannedIPs[bannedIP],
    ).toISOString()})`;

    jest.useRealTimers();
    expect(response).toEqual([]);
    expect(mockLogger.warning).toHaveBeenCalledWith(expectedError);
  });

  it('should process token generation for banned IP after unban', async () => {
    const bannedIP = '192.168.1.1';

    useCase.setBannedIP(bannedIP);

    jest.useFakeTimers();
    jest.setSystemTime(
      new Date((useCase as any).bannedIPs[bannedIP]).getTime() + 1,
    );

    const request: any = {
      clientId: '0x456',
      chainId: 2,
      scope: 'read:write',
      clientIp: bannedIP,
      clientAgent: 'test-agent-2',
      grantType: GrantType.EIP4361,
    };

    const response = await useCase.execute(request);

    const expectedError = `[${request.clientId}@${request.clientIp}:${request.clientAgent}] credential rejection: undefined (challenge not found)`;

    jest.useRealTimers();
    expect(response).toEqual([]);
    expect(mockLogger.warning).toHaveBeenCalledWith(expectedError);
  });

  it('should unban IP after the ban duration expires', async () => {
    const tempBannedIP = '192.168.1.2';
    useCase.setBannedIP(tempBannedIP);

    jest
      .useFakeTimers()
      .setSystemTime(
        new Date((useCase as any).bannedIPs[tempBannedIP]).getTime() + 1,
      );

    expect(useCase.isBannedIP(tempBannedIP)).toBe(false);

    jest.useRealTimers();
  });

  it('should reject requests with an invalid clientId format', async () => {
    const request: GenerateTokenRequestDto = {
      clientId: 'invalidClientId',
      chainId: 1,
      clientIp: '127.0.0.1',
      clientAgent: 'user-agent-string',
      challengeId: 'challengeId',
      signature: 'signature',
    };

    const returnedValue = await useCase.execute(request);

    expect(returnedValue).toEqual([]);

    expect(mockLogger.warning).toHaveBeenCalledWith(
      expect.stringContaining(
        '[invalidClientId@127.0.0.1:user-agent-string] credential rejection: challengeId (challenge not found)',
      ),
    );
  });

  describe('getResourceScopesFromRoles', () => {
    it('should return the resource scopes for the given roles', () => {
      const roles = [RoleType.IMPACT_CULTIVATION_VALIDATOR];
      const expectedScopes = {
        [RoleType.IMPACT_CULTIVATION_VALIDATOR]: {
          [ResourceCategoryEnum.IMPACTFUL_CULTIVATION]: {
            [ImpactfulCultivationResourceEnum.AUDIT_POOL]: [ScopeType.READ],
            [ImpactfulCultivationResourceEnum.VALIDATOR_STASH]: [
              ScopeType.READ,
              ScopeType.WRITE,
              ScopeType.OVERWRITE,
            ],
            [ImpactfulCultivationResourceEnum.VALIDATOR_VEREDICT]: [
              ScopeType.WRITE,
            ],
            [ImpactfulCultivationResourceEnum.PRODUCER_DOCUMENT]: [
              ScopeType.READ,
            ],
          },
        },
      };

      const result = GenerateAuthTokenUseCase.getResourceScopesFromRoles(roles);

      expect(result).toEqual(expectedScopes);
    });
  });
});

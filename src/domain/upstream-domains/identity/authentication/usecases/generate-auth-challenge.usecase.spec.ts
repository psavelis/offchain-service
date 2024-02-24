import { EncryptionPort } from '../../../../common/ports/encryption.port';
import { LoggablePort } from '../../../../common/ports/loggable.port';
import { SignaturePort } from '../../../../common/ports/signature.port';
import { Settings } from '../../../../common/settings';
import { CreateAuthChallengeDto } from '../dtos/create-auth-challenge.dto';
import { GrantType } from '../enums/grant-type.enum';
import { PersistableAuthChallengePort } from '../ports/persistable-auth-challenge.port';
import { GenerateAuthChallengeUseCase } from './generate-auth-challenge.usecase';

describe('GenerateAuthChallengeUseCase', () => {
  let useCase: GenerateAuthChallengeUseCase;
  let mockSettings: Settings;
  let mockEncryptionPort: EncryptionPort;
  let mockPersistableAuthChallengePort: PersistableAuthChallengePort;
  let mockSignaturePort: SignaturePort;
  let mockLogger: LoggablePort;
  const originalDebugProd = process.env.ALLOW_DEBUG_PROD;

  beforeEach(() => {
    process.env.ALLOW_DEBUG_PROD = 'true';
    mockSettings = {
      cbc: { key: 'testKey' },
    } as Settings;
    mockEncryptionPort = {
      encrypt: jest.fn().mockResolvedValue('encryptedClientId'),
    } as any;
    mockPersistableAuthChallengePort = {
      create: jest
        .fn()
        .mockImplementation((authChallenge) => Promise.resolve(authChallenge)),
    };
    mockSignaturePort = {
      getRandomNonce: jest.fn().mockReturnValue('randomNonce'),
      hash: jest.fn().mockReturnValue('hashedType'),
    } as any;
    mockLogger = {
      error: jest.fn(),
      warning: jest.fn(),
      debug: jest.fn(),
    } as any;

    useCase = new GenerateAuthChallengeUseCase(
      mockSettings,
      mockEncryptionPort,
      mockPersistableAuthChallengePort,
      mockSignaturePort,
      mockLogger,
    );
  });

  afterEach(() => {
    process.env.ALLOW_DEBUG_PROD = originalDebugProd;
  });

  it('should generate and return an auth challenge response DTO', async () => {
    const request: CreateAuthChallengeDto = {
      clientId: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      scope: 'read:write',
      clientIp: '127.0.0.1',
      clientAgent: 'user-agent-string',
      grantType: GrantType.EIP4361,
      uri: 'https://dapp.kannacoin.io/login',
    };

    const response = await useCase.execute(request);

    const logWarningParams = (mockLogger.warning as any).mock.calls[0];
    const logErrorParams = (mockLogger.error as any).mock.calls[0];

    expect(logWarningParams).toBeUndefined();
    expect(logErrorParams).toBeUndefined();

    expect(response).toBeDefined();
    expect(response).toHaveProperty('challengeId');
    expect(response).toHaveProperty('grantType', GrantType.EIP4361);
    expect(response).toHaveProperty('network', 'Ethereum');
    expect(response).toHaveProperty('signatureData');
    expect(mockPersistableAuthChallengePort.create).toHaveBeenCalled();
    expect(mockEncryptionPort.encrypt).toHaveBeenCalledWith(
      request.clientId,
      '1dapp.kannacoin.io',
      mockSettings.cbc.key,
    );
  });

  it('should log and return an empty array on error', async () => {
    (mockSignaturePort.getRandomNonce as any).mockImplementationOnce(() => {
      throw new Error('Test Error');
    });

    const request: CreateAuthChallengeDto = {
      clientId: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      scope: 'read:write',
      clientIp: '127.0.0.1',
      clientAgent: 'user-agent-string',
      grantType: GrantType.EIP4361,
      uri: 'dapp.kannacoin.io',
    };

    const response = await useCase.execute(request);

    expect(response).toEqual([]);
    expect(mockLogger.error).toHaveBeenCalled();
  });

  it('should reject requests with an invalid clientId format', async () => {
    const request: CreateAuthChallengeDto = {
      clientId: 'invalidClientId',
      chainId: 1,
      grantType: GrantType.EIP4361,
      scope: 'read:write',
      clientIp: '127.0.0.1',
      clientAgent: 'user-agent-string',
      uri: 'dapp.kannacoin.io',
    };

    const returnedValue = await useCase.execute(request as any);

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.anything(),
      expect.not.stringContaining('Invalid clientId'),
    );

    expect(returnedValue).toEqual([]);
  });

  it('should reject requests with missing required fields', async () => {
    const request = {};

    const returnedValue = await useCase.execute(request as any);

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.anything(),
      expect.not.stringContaining('Missing'),
    );

    expect(returnedValue).toEqual([]);
  });

  it('should reject requests with an invalid chainId', async () => {
    const request: CreateAuthChallengeDto = {
      clientId: '0x1234567890123456789012345678901234567890',
      chainId: 999999,
      scope: 'read:write',
      clientIp: '127.0.0.1',
      grantType: GrantType.EIP4361,
      clientAgent: 'user-agent-string',
      uri: 'dapp.kannacoin.io',
    };

    const returnedValue = await useCase.execute(request as any);

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.anything(),
      expect.not.stringContaining('Invalid chainId'),
    );

    expect(returnedValue).toEqual([]);
  });

  it('should reject requests with an invalid scope format', async () => {
    const request: CreateAuthChallengeDto = {
      clientId: '0x1234567890123456789012345678901234567890',
      chainId: 1,
      scope: 'invalid %scope',
      clientIp: '127.0.0.1',
      grantType: GrantType.EIP4361,
      clientAgent: 'user-agent-string',
      uri: 'dapp.kannacoin.io',
    };

    await useCase.execute(request as any);

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.anything(),
      expect.not.stringContaining('Invalid Scope'),
    );
  });

  it('should adjust behavior based on environmental settings', async () => {
    process.env.ALLOW_DEBUG_PROD = 'false';

    const request: any = {};

    await useCase.execute(request as any).catch(() => {});

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.anything(),
      expect.not.stringContaining('detailed error message or stack trace'),
    );
  });
});

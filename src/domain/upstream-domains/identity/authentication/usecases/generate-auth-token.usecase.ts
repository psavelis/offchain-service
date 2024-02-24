/* eslint-disable @typescript-eslint/no-explicit-any */
import { DAPP_DOMAIN } from '../../../../common/constants/domains.contants';
import { type TokenPayload } from '../../../../common/dtos/token-payload.dto';
import { Chain } from '../../../../common/entities/chain.entity';
import { type EncryptionPort } from '../../../../common/ports/encryption.port';
import { type LoggablePort } from '../../../../common/ports/loggable.port';
import { type SignaturePort } from '../../../../common/ports/signature.port';
import { type Settings } from '../../../../common/settings';
import { type GenerateTokenRequestDto } from '../dtos/generate-token-request.dto';
import { AccessToken } from '../entities/access-token.entity';
import { type AuthChallenge } from '../entities/auth-challenge.entity';
import { type Role } from '../entities/role.entity';
import { GrantType } from '../enums/grant-type.enum';
import {
  ResourcesByRole,
  RoleType,
  type ResourceCategoryScopes,
} from '../enums/role-type.enum';
import { GenerateAuthTokenInteractor } from '../interactors/generate-auth-token.interactor';
import { type FetchableAuthChallengePort } from '../ports/fetchable-auth-challenge.port';
import { type FetchableRolePort } from '../ports/fetchable-role.port';
import { type JwtPort } from '../ports/jwt.port';
import { type PersistableAccessTokenPort } from '../ports/persistable-access-token.port';

const maxFailures = 5;

export class GenerateAuthTokenUseCase implements GenerateAuthTokenInteractor {
  private bannedIPs: Record<string, Date> = {};
  private ipRetryCount: Record<string, { count: number; lastFailure: Date }> =
    {};

  constructor(
    private readonly settings: Settings,
    private readonly encryptionPort: EncryptionPort,
    private readonly fetchableAuthChallengePort: FetchableAuthChallengePort,
    private readonly signaturePort: SignaturePort,
    private readonly persistableAccessTokenPort: PersistableAccessTokenPort,
    private readonly fetchableRolePort: FetchableRolePort,
    private readonly jwtPort: JwtPort,
    private readonly logger: LoggablePort,
  ) {}

  async execute(request: GenerateTokenRequestDto): Promise<any> {
    try {
      const token = await this.generateToken(request);

      return token;
    } catch (err) {
      this.setFailedIPRequest(request.clientIp);
      this.logger.warn(err, 'credential rejection');

      return [];
    }
  }

  validateRequest(request: GenerateTokenRequestDto) {
    if (!request.clientId) {
      throw new Error('Missing client id');
    }

    if (!request.clientIp) {
      throw new Error('Missing client ip');
    }

    if (!request.clientAgent) {
      throw new Error('Missing client agent');
    }

    if (!request.challengeId) {
      throw new Error('Missing challenge id');
    }

    if (!request.signature) {
      throw new Error('Missing signature');
    }

    if (!request.chainId) {
      throw new Error('Missing chainId');
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(request.clientId)) {
      throw new Error('Invalid clientId');
    }

    const chain = new Chain(request.chainId);
    if (chain.id !== request.chainId) {
      throw new Error('Invalid chainId');
    }
  }

  isBannedIP(ip: string) {
    return this.bannedIPs[ip] && this.bannedIPs[ip] >= new Date();
  }

  setBannedIP(ip: string) {
    this.bannedIPs[ip] = new Date(Date.now() + 1000 * 60 * 60 * 24);
  }

  isIPRetryLimitReached(ip: string) {
    const retryCount = this.ipRetryCount[ip]?.count;

    return retryCount && retryCount >= maxFailures;
  }

  setSuccessfulIPRequest(ip: string) {
    if ((this.ipRetryCount[ip].count ?? 0) > 0) {
      this.ipRetryCount[ip].count -= 1;
    }
  }

  setFailedIPRequest(ip: string) {
    const retryCount = this.ipRetryCount[ip]?.count || 0;
    const lastFailure = this.ipRetryCount[ip]?.lastFailure || new Date();

    if (lastFailure < new Date(Date.now() - 1000 * 60 * 60 * 24)) {
      this.ipRetryCount[ip] = {
        count: 1,
        lastFailure: new Date(),
      };

      return;
    }

    this.ipRetryCount[ip] = {
      count: retryCount + 1,
      lastFailure: new Date(),
    };

    if (this.isIPRetryLimitReached(ip)) {
      this.setBannedIP(ip);
    }
  }

  async generateToken(request: GenerateTokenRequestDto) {
    if (this.isBannedIP(request.clientIp)) {
      this.logger.warn(
        `${this.formatId(request)} credential rejection: ${
          request.challengeId
        } (banned ip, due: ${this.bannedIPs[request.clientIp].toISOString()})`,
      );

      return [];
    }

    const authChallenge: AuthChallenge | undefined =
      await this.fetchableAuthChallengePort.findByChallengeId(
        request.challengeId,
      );

    if (!authChallenge) {
      this.setFailedIPRequest(request.clientIp);
      this.logChallengeNotFound(request);

      return [];
    }

    if (authChallenge?.getGrantType() !== GrantType.EIP4361) {
      this.setFailedIPRequest(request.clientIp);
      this.logInvalidGrantType(request);

      return [];
    }

    if (authChallenge.getDueDate() < new Date()) {
      this.logger.warn(
        `${this.formatId(request)} credential rejection: ${
          request.challengeId
        } (challenge expired)`,
      );

      return [];
    }

    if (authChallenge.getClientIp() !== request.clientIp) {
      this.setFailedIPRequest(request.clientIp);
      this.logger.warn(
        `${this.formatId(request)} credential rejection: ${
          request.challengeId
        } (challenge ip mismatch)`,
      );
      return [];
    }

    if (authChallenge.getClientAgent() !== request.clientAgent) {
      this.setFailedIPRequest(request.clientIp);
      this.logger.warn(
        `${this.formatId(request)} credential rejection: ${
          request.challengeId
        } (challenge agent mismatch)`,
      );
      return [];
    }

    if (authChallenge.getChainId() !== request.chainId) {
      this.setFailedIPRequest(request.clientIp);
      this.logger.warn(
        `${this.formatId(request)} credential rejection: ${
          request.challengeId
        } (challenge chain mismatch)`,
      );
      return [];
    }

    if (!request.signature) {
      this.setFailedIPRequest(request.clientIp);
      this.logger.warn(
        `${this.formatId(request)} credential rejection: ${
          request.challengeId
        } (missing signature)`,
      );
      return [];
    }

    if (!this.isValidEIP4361Signature(request.signature)) {
      this.setFailedIPRequest(request.clientIp);
      this.logInvalidEIP4361Signature(request);

      return [];
    }

    const requestedScopes = authChallenge.getRawScopes();

    const error = this.validateRequestedScopes(requestedScopes);

    if (error) {
      this.setFailedIPRequest(request.clientIp);
      this.logInvalidScopeRequest(request, error, requestedScopes);

      return [];
    }

    const payload = authChallenge.getPayload();

    const isValid = await this.signaturePort.verify(
      request.clientId,
      payload,
      request.signature,
    );

    if (!isValid) {
      this.setFailedIPRequest(request.clientIp);
      this.logInvalidSignature(request);

      return [];
    }

    const encryptedIdentifier = await this.encryptionPort.encrypt(
      request.clientId,
      String(request.chainId) + DAPP_DOMAIN,
      this.settings.cbc.key,
    );

    if (authChallenge.getUserIdentifier() !== encryptedIdentifier) {
      this.setFailedIPRequest(request.clientIp);
      this.logger.warn(
        `${this.formatId(request)} challenge rejection: ${
          request.challengeId
        } (ownership mismatch)`,
      );
      return [];
    }

    const validatedRoles = await this.resolveRoles(
      encryptedIdentifier,
      request.clientId,
      authChallenge.getChainId(),
      authChallenge.getRoles(),
    );

    if (!validatedRoles?.length) {
      this.setFailedIPRequest(request.clientIp);
      this.logNoScopesMatched(request, requestedScopes);

      return [];
    }

    if (validatedRoles.length !== requestedScopes.length) {
      this.setFailedIPRequest(request.clientIp);
      this.logScopeDenied(request, requestedScopes);

      return [];
    }

    if (
      requestedScopes.some(
        (scope) =>
          !validatedRoles
            .map((role) => RoleType[role.getRoleType()])
            .includes(scope),
      )
    ) {
      this.setFailedIPRequest(request.clientIp);
      this.logScopeDenied(request, requestedScopes);

      return [];
    }

    const roles: RoleType[] = validatedRoles.map((role) => role.getRoleType());
    const scopes: Partial<ResourceCategoryScopes> =
      GenerateAuthTokenUseCase.getResourceScopesFromRoles(roles);

    const accessToken: AccessToken =
      await this.persistableAccessTokenPort.create(
        new AccessToken({
          challengeId: authChallenge.getId(),
          userIdentifier: encryptedIdentifier,
          grantType: authChallenge.getGrantType(),
          chainId: authChallenge.getChainId(),
          roles,
          scopes,
          dueDate: new Date(Date.now() + 1000 * 60 * 60),
          clientIp: authChallenge.getClientIp(),
          clientAgent: authChallenge.getClientAgent(),
        }),
      );

    const encryptedTokenId: string = await this.encryptionPort.encrypt(
      accessToken.getId(),
      String(authChallenge.getChainId().valueOf()) + DAPP_DOMAIN,
      this.settings.cbc.key,
    );

    const tokenPayload: TokenPayload = {
      id: encryptedTokenId,
      sub: encryptedIdentifier,
      chainId: String(authChallenge.getChainId().valueOf()),
      roles,
      scopes,
    };

    const jwt: string = await this.jwtPort.sign(tokenPayload);

    return {
      access_token: jwt,
      token_type: 'Bearer',
      expires_in: 3600,
    };
  }

  logInvalidGrantType(request: GenerateTokenRequestDto) {
    this.logger.warn(
      `${this.formatId(request)} credential rejection: ${
        request.challengeId
      } (invalid grant type)`,
    );
  }

  static getResourceScopesFromRoles(
    roles: RoleType[],
  ): Partial<ResourceCategoryScopes> {
    return roles
      .filter((roleType: RoleType) => ResourcesByRole[roleType]?.resources)
      .reduce<Partial<ResourceCategoryScopes>>((acc, roleType: RoleType) => {
        return acc[roleType]
          ? acc
          : { ...acc, [roleType]: ResourcesByRole[roleType].resources };
      }, {});
  }

  async resolveRoles(
    encryptedIdentifier: string,
    clientId: string,
    chainId: number,
    requestedScopes: RoleType[],
  ): Promise<Role[]> {
    const rolesFromDatabase: Role[] =
      await this.fetchableRolePort.findByClientIdAndChainId(
        encryptedIdentifier,
        chainId,
        requestedScopes,
      );

    if (!rolesFromDatabase) {
      console.error(
        `No roles found for ${clientId} (${encryptedIdentifier}) on chain ${chainId} with ${JSON.stringify(
          requestedScopes,
        )}`,
      );

      return [];
    }

    const filteredRoles = rolesFromDatabase.filter((role) => {
      if (!role) {
        return false;
      }

      const expiration = role.getExpiresAt();
      if (expiration && expiration < new Date()) {
        console.error(
          `Role expired for ${clientId} (${encryptedIdentifier}) on chain ${chainId} with ${JSON.stringify(
            { requestedScopes, filteredRoles, role },
          )}`,
        );
        return false;
      }

      return true;
    });

    if (!filteredRoles?.length) {
      return [];
    }

    const expectedFingerprints = filteredRoles.map(async (role) => {
      const hash = [
        role.getUserIdentifier(),
        role.getChainId(),
        role.getTransactionHash(),
        role.getSourceAddress(),
        role.getEventType(),
      ].join('|');

      const fingerprint = await this.encryptionPort.encrypt(
        hash,
        role.getTransactionHash(),
        this.settings.cbc.key,
      );

      return fingerprint;
    });

    const expectedFingerprintsSet = new Set(
      await Promise.all(expectedFingerprints),
    );

    const validatedFingerprints = filteredRoles.filter((role) =>
      expectedFingerprintsSet.has(role.getFingerprint()),
    );

    if (!validatedFingerprints?.length) {
      console.error(
        `No validated fingerprints for ${clientId} (${encryptedIdentifier}) on chain ${chainId} with ${JSON.stringify(
          requestedScopes,
        )}`,
      );

      return [];
    }

    return validatedFingerprints;
  }

  validateRequestedScopes(requestedScopes: string[]) {
    if (!requestedScopes?.length) {
      return 'Empty scope';
    }

    if (requestedScopes.length > 8) {
      return 'Too many scopes';
    }

    if (requestedScopes.some((scope) => scope.length > 64 || !scope?.trim())) {
      return 'Invalid scope length';
    }

    if (
      requestedScopes.some(
        (scope) => !Object.values(RoleType).includes(Number(scope)),
      )
    ) {
      return 'Scope not found';
    }

    return null;
  }

  logScopeDenied(request: any, requestedScopes: string[]) {
    this.logger.warn(
      `${this.formatId(request)} credential rejection: \`${encodeURI(
        requestedScopes.join(' '),
      )}\` (scope denied)`,
    );
  }

  private logChallengeNotFound(request: any) {
    this.logger.warn(
      `${this.formatId(request)} credential rejection: ${
        request.challengeId
      } (challenge not found)`,
    );
  }

  private logNoScopesMatched(request: any, requestedScopes: string[]) {
    this.logger.warn(
      `${this.formatId(request)} credential rejection: \`${encodeURI(
        requestedScopes.join(' '),
      )}\` (scope not found)`,
    );
  }

  private logInvalidSignature(request: any) {
    this.logger.warn(
      `${this.formatId(request)} credential rejection: ${
        request.signature
      } (signature verification failed)`,
    );
  }

  private logInvalidEIP4361Signature(request: any) {
    this.logger.warn(
      `${this.formatId(request)} credential rejection: ${
        request.signature
      } (unmet EIP-4361)`,
    );
  }

  private logInvalidScopeRequest(
    request: any,
    error: string,
    requestedScopes: any,
  ) {
    this.logger.warn(
      `${this.formatId(request)} credential rejection (${error}): \`${encodeURI(
        requestedScopes.join(' '),
      )}\` (invalid scope)`,
    );
  }

  formatId(request: any) {
    return `[${request.clientId}@${request.clientIp}:${request.clientAgent}]`;
  }

  isValidEIP4361Signature(signature) {
    if (typeof signature !== 'string' || !signature.startsWith('0x')) {
      return false;
    }

    const hexPart = signature.slice(2);
    if (hexPart.length !== 130) {
      return false;
    }

    const hexRegex = /^[0-9a-fA-F]+$/;
    return hexRegex.test(hexPart);
  }
}

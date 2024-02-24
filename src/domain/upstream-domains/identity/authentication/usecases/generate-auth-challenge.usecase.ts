import { URL } from 'url';
import { DAPP_DOMAIN } from '../../../../common/constants/domains.contants';
import { Chain } from '../../../../common/entities/chain.entity';
import { NetworkType } from '../../../../common/enums/network-type.enum';
import { type EncryptionPort } from '../../../../common/ports/encryption.port';
import { type LoggablePort } from '../../../../common/ports/loggable.port';
import { type SignaturePort } from '../../../../common/ports/signature.port';
import { type Settings } from '../../../../common/settings';
import { type AuthChallengeResponseDto } from '../dtos/auth-challenge-response.dto';
import { type AuthChallengeSignatureData } from '../dtos/auth-challenge-signature-data.dto';
import { type CreateAuthChallengeDto } from '../dtos/create-auth-challenge.dto';
import { AuthChallenge } from '../entities/auth-challenge.entity';
import { GrantType } from '../enums/grant-type.enum';
import { type PersistableAuthChallengePort } from '../ports/persistable-auth-challenge.port';

export class GenerateAuthChallengeUseCase {
  constructor(
    private readonly settings: Settings,
    private readonly encryptionPort: EncryptionPort,
    private readonly persistableAuthChallengePort: PersistableAuthChallengePort,
    private readonly signaturePort: SignaturePort,
    private readonly logger: LoggablePort,
  ) {}

  async execute(
    request: CreateAuthChallengeDto,
  ): Promise<AuthChallengeResponseDto | []> {
    try {
      const { authChallenge, signatureData, chain } = await this.generate(
        request,
      );

      return {
        challengeId: authChallenge.getId(),
        signatureData,
        grantType: GrantType[authChallenge.getGrantType()],
        network: NetworkType[chain.id],
      };
    } catch (err) {
      this.logRequestError(request, err);

      return [];
    }
  }

  async generate(request: CreateAuthChallengeDto): Promise<{
    authChallenge: AuthChallenge;
    signatureData: AuthChallengeSignatureData;
    chain: Chain;
  }> {
    this.validateRequest(request);

    const randomuint256 = this.signaturePort
      .getRandomNonce()
      .slice(2, 16)
      .toUpperCase();

    const chain = new Chain(request.chainId);

    const signatureData = AuthChallenge.getSignatureData(
      request.clientId,
      randomuint256,
      chain,
      request.uri,
    );

    const encryptedIdentifier = await this.encryptionPort.encrypt(
      request.clientId,
      String(chain.id) + signatureData.domain,
      this.settings.cbc.key,
    );

    const authChallenge = await this.persistableAuthChallengePort.create(
      new AuthChallenge({
        userIdentifier: encryptedIdentifier,
        grantType: GrantType.EIP4361,
        chainId: request.chainId,
        payload: signatureData,
        nonce: randomuint256,
        scope: request.scope,
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
        clientIp: request.clientIp,
        clientAgent: request.clientAgent,
        uri: signatureData.uri,
      }),
    );

    return { authChallenge, signatureData, chain };
  }

  validateRequest(request: CreateAuthChallengeDto) {
    if (!request.clientId) {
      throw new Error('Missing clientId');
    }

    if (!/^0x[a-fA-F0-9]{40}$/.test(request.clientId)) {
      throw new Error('Invalid clientId');
    }

    if (!request.chainId) {
      throw new Error('Missing chainId');
    }

    const chain = new Chain(request.chainId);
    if (chain.id !== request.chainId) {
      throw new Error('Invalid chainId');
    }

    if (!request.scope) {
      throw new Error('Missing scope');
    }

    if (!/^[\w\-:,._]+$/.test(request.scope)) {
      throw new Error('Invalid scope');
    }

    try {
      const url = new URL(request.uri);
      if (DAPP_DOMAIN !== url.hostname) {
        throw new Error('URI domain is not allowed');
      }
    } catch (error) {
      throw new Error('Invalid URI');
    }
  }

  private logRequestError(request: CreateAuthChallengeDto, err: Error) {
    this.logger.error(
      err,
      `Error generating auth challenge for \`${JSON.stringify(request)}\``,
    );
  }
}

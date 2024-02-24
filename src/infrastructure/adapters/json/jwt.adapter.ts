import jwt from 'jsonwebtoken';
import {
  AUTH_DOMAIN,
  DAPP_DOMAIN,
} from '../../../domain/common/constants/domains.contants';
import { type TokenPayload } from '../../../domain/common/dtos/token-payload.dto';
import { type EncryptionPort } from '../../../domain/common/ports/encryption.port';
import { type Settings } from '../../../domain/common/settings';
import { type JwtPort } from '../../../domain/upstream-domains/identity/authentication/ports/jwt.port';

export class JwtAdapter implements JwtPort {
  static instance: JwtPort;

  private constructor(
    readonly settings: Settings,
    readonly encryptionPort: EncryptionPort,
  ) {}

  static getInstance(settings: Settings, encryptionPort: EncryptionPort) {
    if (!JwtAdapter.instance) {
      JwtAdapter.instance = new JwtAdapter(settings, encryptionPort);
    }

    return JwtAdapter.instance;
  }

  async sign(payload: TokenPayload): Promise<string> {
    const key = this.getKey(this.settings);

    const payloadToSign = {
      ...payload,
      aud: DAPP_DOMAIN,
      iss: AUTH_DOMAIN,
    };

    return new Promise((resolve, reject) => {
      const options: jwt.SignOptions = {
        algorithm: 'ES512',
        expiresIn: this.settings.ecdsaP521.expiresIn,
      };
      jwt.sign(payloadToSign, key, options, (err, token) => {
        if (err) reject(err);
        else resolve(token);
      });
    });
  }

  async verify(token: string, cryptoWallet?: string): Promise<TokenPayload> {
    const key = this.getKey(this.settings);

    const decoded: jwt.JwtPayload = await new Promise((resolve, reject) => {
      jwt.verify(
        token,
        key,
        { audience: DAPP_DOMAIN, issuer: AUTH_DOMAIN, algorithms: ['ES512'] },
        (err, decoded) => {
          if (err) reject(err);
          else resolve(decoded as jwt.JwtPayload);
        },
      );
    });

    if (cryptoWallet) {
      await this.validateSubject(decoded, cryptoWallet);
    }

    return decoded as TokenPayload;
  }

  private async validateSubject(
    token: jwt.JwtPayload,
    cryptoWallet: string | undefined,
  ): Promise<void> {
    if (!cryptoWallet) {
      return;
    }

    const { sub, chainId } = token;

    if (!sub) {
      throw new Error('Subject is undefined');
    }

    if (!chainId) {
      throw new Error('Chain ID is undefined');
    }

    const decryptedIdentifier = await this.encryptionPort.decrypt(
      sub,
      chainId,
      this.settings.cbc.key,
    );

    if (decryptedIdentifier !== cryptoWallet) {
      throw new Error('Subject does not match');
    }
  }

  private getKey(settings: Settings): string {
    const key = settings.ecdsaP521.key;
    if (typeof key !== 'string') {
      throw new Error('ECDSA key is undefined or not a string');
    }

    return Buffer.from(key, 'base64').toString('ascii');
  }
}

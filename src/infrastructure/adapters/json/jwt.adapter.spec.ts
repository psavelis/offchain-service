import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import {
  AUTH_DOMAIN,
  DAPP_DOMAIN,
} from '../../../domain/common/constants/domains.contants';
import { TokenPayload } from '../../../domain/common/dtos/token-payload.dto';
import { EncryptionPort } from '../../../domain/common/ports/encryption.port';
import { RoleType } from '../../../domain/upstream-domains/identity/authentication/enums/role-type.enum';
import { Aes256EncryptionAdapter } from '../crypto/aes256/aes-256-encryption.adapter';
import { JwtAdapter } from './jwt.adapter';

describe('JwtAdapter', () => {
  let mockSettings;
  let jwtAdapter: JwtAdapter;
  let privateKey: string;
  let publicKey: string;
  let encryptionPort: EncryptionPort;

  beforeAll(() => {
    encryptionPort = Aes256EncryptionAdapter.getInstance();

    ({ privateKey, publicKey } = generateEcdsaKeyPair());
    mockSettings = {
      ecdsaP521: {
        key: Buffer.from(privateKey).toString('base64'),
        pubKey: Buffer.from(publicKey).toString('base64'),
        expiresIn: '1h',
      },
      cbc: {
        key: 'secretsecretsecretsecretsecretse',
      },
    };
    jwtAdapter = JwtAdapter.getInstance(
      mockSettings,
      encryptionPort,
    ) as JwtAdapter;
  });

  describe('sign and verify', () => {
    it('should successfully sign and verify a payload', async () => {
      const encryptedIdentifier = await encryptionPort.encrypt(
        'clientId',
        '137' + DAPP_DOMAIN,
        mockSettings.cbc.key,
      );

      const payload: TokenPayload = {
        id: 'jwtid',
        sub: encryptedIdentifier,
        iss: AUTH_DOMAIN,
        aud: DAPP_DOMAIN,
        chainId: '137',
        roles: [
          RoleType.IMPACT_CULTIVATION_PRODUCER,
          RoleType.PROMOTIONAL_SUPPLIER,
        ],
      };

      const token = await jwtAdapter.sign(payload);
      expect(token).toBeDefined();

      const decoded = await jwtAdapter.verify(token);
      expect(decoded).toBeDefined();
      expect(decoded.id).toEqual(payload.id);
    });

    it('should fail to verify a token if the payload has been altered', async () => {
      const originalPayload = { id: 'user123' };

      const token = await jwtAdapter.sign(originalPayload);

      const parts = token.split('.');
      const alteredPayload = Buffer.from(
        JSON.stringify({ id: 'user456' }),
      ).toString('base64');

      const alteredToken = `${parts[0]}.${alteredPayload}.${parts[2]}`;

      await expect(jwtAdapter.verify(alteredToken)).rejects.toThrow();
    });

    it('should not verify a token with an incorrect key', async () => {
      const payload = { id: 'user123' };
      const token = await jwtAdapter.sign(payload);

      const originalGetKey = (jwtAdapter as any).getKey;
      (jwtAdapter as any).getKey = () => 'invalid-key';

      await expect(jwtAdapter.verify(token)).rejects.toThrow();

      (jwtAdapter as any).getKey = originalGetKey;
    });

    it('should reject an expired token', async () => {
      const invalidDomain = 'invalidDomain';
      const encryptedIdentifier = await encryptionPort.encrypt(
        'clientId',
        '137' + DAPP_DOMAIN,
        mockSettings.cbc.key,
      );

      const payload = {
        id: 'jwtid',
        sub: encryptedIdentifier,
        iss: AUTH_DOMAIN,
        aud: invalidDomain,
        chainId: '137',
        roles: ['transfer:erc20:0x0000', 'transfer:erc20:0x0001'],
        exp: Math.floor(Date.now() / 1000) - 60 * 60,
      };

      const token: string = await new Promise((resolve, reject) => {
        const options: jwt.SignOptions = {
          algorithm: 'ES512',
        };
        jwt.sign(payload, privateKey, options, (err, token) => {
          if (err) reject(err);
          else resolve(token!);
        });
      });

      await expect(jwtAdapter.verify(token)).rejects.toThrow('jwt expired');
    });

    it('should not verify a token signed with a different algorithm', async () => {
      const fakeToken = 'fakeToken';

      await expect(jwtAdapter.verify(fakeToken)).rejects.toThrow();
    });

    it('should reject tokens claiming to use the "none" signing algorithm', async () => {
      const header = Buffer.from(
        JSON.stringify({ alg: 'none', typ: 'JWT' }),
      ).toString('base64');
      const payload = Buffer.from(JSON.stringify({ id: 'user123' })).toString(
        'base64',
      );
      const noneToken = `${header}.${payload}.`;

      await expect(jwtAdapter.verify(noneToken)).rejects.toThrow();
    });

    it('should validate all configured claims correctly', async () => {
      const payload = {
        sub: 'user123',
        aud: 'fakeAudience',
        iss: 'fakeIssuer',
      };
      const token = await jwtAdapter.sign(payload);

      const decoded = await jwtAdapter.verify(token);
      expect(decoded).toHaveProperty('sub', 'user123');
      expect(decoded).toHaveProperty('aud', DAPP_DOMAIN);
      expect(decoded).toHaveProperty('iss', AUTH_DOMAIN);
    });

    it('should reject tokens with an invalid audience', async () => {
      const invalidDomain = 'invalidDomain';
      const encryptedIdentifier = await encryptionPort.encrypt(
        'clientId',
        '137' + DAPP_DOMAIN,
        mockSettings.cbc.key,
      );

      const payload = {
        id: 'jwtid',
        sub: encryptedIdentifier,
        iss: AUTH_DOMAIN,
        aud: invalidDomain,
        chainId: '137',
        roles: [RoleType.ADMIN],
      };

      const token: string = await new Promise((resolve, reject) => {
        const options: jwt.SignOptions = {
          algorithm: 'ES512',
          expiresIn: '1h',
        };
        jwt.sign(payload, privateKey, options, (err, token) => {
          if (err) reject(err);
          else resolve(token!);
        });
      });

      await expect(jwtAdapter.verify(token)).rejects.toThrow();
    });

    it('should verify valid jwt using public key', async () => {
      const encryptedIdentifier = await encryptionPort.encrypt(
        'clientId',
        '137' + DAPP_DOMAIN,
        mockSettings.cbc.key,
      );

      const payload: TokenPayload = {
        id: 'jwtid',
        sub: encryptedIdentifier,
        iss: AUTH_DOMAIN,
        aud: DAPP_DOMAIN,
        chainId: '137',
        roles: [
          RoleType.IMPACT_CULTIVATION_PRODUCER,
          RoleType.PROMOTIONAL_SUPPLIER,
        ],
      };

      const token = await jwtAdapter.sign(payload);

      await expect(async () => {
        jwt.verify(token, publicKey, {
          algorithms: ['ES512'],
          audience: DAPP_DOMAIN,
          issuer: AUTH_DOMAIN,
        });
      }).not.toThrow();
    });

    it('should not verify invalid jwt using public key', async () => {
      const encryptedIdentifier = await encryptionPort.encrypt(
        'clientId',
        '137' + DAPP_DOMAIN,
        mockSettings.cbc.key,
      );

      const payload = {
        id: 'jwtid',
        sub: encryptedIdentifier,
        iss: AUTH_DOMAIN,
        aud: DAPP_DOMAIN,
        chainId: '137',
        roles: [
          RoleType.IMPACT_CULTIVATION_PRODUCER,
          RoleType.PROMOTIONAL_SUPPLIER,
        ],
      };

      const token = await jwtAdapter.sign(payload);

      await expect(
        new Promise((resolve, reject) => {
          jwt.verify(
            token,
            publicKey,
            {
              algorithms: ['ES512'],
              audience: DAPP_DOMAIN,
              issuer: 'invalidIssuer',
            },
            (err, decoded) => {
              if (err) reject(err);
              else resolve(decoded);
            },
          );
        }),
      ).rejects.toThrow();
    });

    it('should not verify jwt with invalid signature', async () => {
      const encryptedIdentifier = await encryptionPort.encrypt(
        'clientId',
        '137' + DAPP_DOMAIN,
        mockSettings.cbc.key,
      );

      const payload = {
        id: 'jwtid',
        sub: encryptedIdentifier,
        iss: AUTH_DOMAIN,
        aud: DAPP_DOMAIN,
        chainId: '137',
        roles: [
          RoleType.IMPACT_CULTIVATION_PRODUCER,
          RoleType.PROMOTIONAL_SUPPLIER,
        ],
      };

      const token = await jwtAdapter.sign(payload);

      const parts = token.split('.');
      const alteredPayload = Buffer.from(
        JSON.stringify({ id: 'user456' }),
      ).toString('base64');

      const alteredToken = `${parts[0]}.${alteredPayload}.${parts[2]}`;

      await expect(
        new Promise((resolve, reject) => {
          jwt.verify(
            alteredToken,
            publicKey,
            {
              algorithms: ['ES512'],
              audience: DAPP_DOMAIN,
              issuer: AUTH_DOMAIN,
            },
            (err, decoded) => {
              if (err) reject(err);
              else resolve(decoded);
            },
          );
        }),
      ).rejects.toThrow();
    });

    it('should not verify jwt with wrong public key', async () => {
      const encryptedIdentifier = await encryptionPort.encrypt(
        'clientId',
        '137' + DAPP_DOMAIN,
        mockSettings.cbc.key,
      );

      const payload = {
        id: 'jwtid',
        sub: encryptedIdentifier,
        iss: AUTH_DOMAIN,
        aud: DAPP_DOMAIN,
        chainId: '137',
        roles: [
          RoleType.IMPACT_CULTIVATION_PRODUCER,
          RoleType.PROMOTIONAL_SUPPLIER,
        ],
      };

      const token = await jwtAdapter.sign(payload);

      const { publicKey: wrongPublicKey } = generateEcdsaKeyPair();

      await expect(
        new Promise((resolve, reject) => {
          jwt.verify(
            token,
            wrongPublicKey,
            {
              algorithms: ['ES512'],
              audience: DAPP_DOMAIN,
              issuer: AUTH_DOMAIN,
            },
            (err, decoded) => {
              if (err) reject(err);
              else resolve(decoded);
            },
          );
        }),
      ).rejects.toThrow();
    });

    it('should not verify jwt before the "nbf" timestamp', async () => {
      const futureTime = Math.floor(Date.now() / 1000) + 60 * 5;

      const payload = {
        id: 'jwtid',
        sub: 'clientId',
        iss: AUTH_DOMAIN,
        aud: DAPP_DOMAIN,
        chainId: '137',
        roles: [
          RoleType.IMPACT_CULTIVATION_PRODUCER,
          RoleType.PROMOTIONAL_SUPPLIER,
        ],
        nbf: futureTime,
      };

      const token = jwt.sign(payload, privateKey, {
        algorithm: 'ES512',
        expiresIn: mockSettings.ecdsaP521.expiresIn,
      });

      await expect(jwtAdapter.verify(token)).rejects.toThrow('jwt not active');
    });
  });
});

function generateEcdsaKeyPair(): { privateKey: string; publicKey: string } {
  const { privateKey, publicKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'P-521',
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
  });

  return {
    privateKey: privateKey.toString(),
    publicKey: publicKey.toString(),
  };
}

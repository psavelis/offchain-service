import { Aes256EncryptionAdapter } from './aes-256-encryption.adapter';
import crypto from 'crypto';

describe('EncryptionAdapter', () => {
  it('should encrypt and decrypt a given email value using uuid', async () => {
    const sampleSensitive = 'user_sensitive_data@no-reply.kannacoin.io';

    const iv = '35025b70-ace1-43ca-9a5f-767679e3297a';

    const secret = 'SomeEncryptSecret';

    const key = crypto
      .createHash('sha256')
      .update(String(secret))
      .digest('base64')
      .slice(0, 32);

    const adapter = Aes256EncryptionAdapter.getInstance();

    const resultEncrypt = await adapter.encrypt(sampleSensitive, iv, key);
    const resultDecrypt = await adapter.decrypt(resultEncrypt, iv, key);

    expect(resultDecrypt).toEqual(sampleSensitive);
  });
});

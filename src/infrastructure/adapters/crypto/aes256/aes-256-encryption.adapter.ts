import {type EncryptionPort} from '../../../../domain/common/ports/encryption.port';
import crypto from 'crypto';
const algorithm = 'aes-256-cbc';

export class Aes256EncryptionAdapter implements EncryptionPort {
  static instance: EncryptionPort;

  private constructor() {}

  static getInstance() {
    if (!Aes256EncryptionAdapter.instance) {
      Aes256EncryptionAdapter.instance = new Aes256EncryptionAdapter();
    }

    return Aes256EncryptionAdapter.instance;
  }

  async encrypt(
    content: string,
    initializationVector: string,
    secret: string,
  ): Promise<string> {
    const iv = this.getIv(initializationVector);

    const cipher = crypto.createCipheriv(algorithm, secret, iv);
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return Promise.resolve(encrypted);
  }

  async decrypt(
    content: string,
    initializationVector: string,
    secret: string,
  ): Promise<string> {
    const iv = this.getIv(initializationVector);
    const decipher = crypto.createDecipheriv(algorithm, secret, iv);

    const decrypted = decipher.update(content, 'hex', 'utf8');

    return Promise.resolve(decrypted + decipher.final('utf8'));
  }

  getIv(ivSource: string): Buffer {
    const md5Bytes: Buffer = crypto.createHash('md5').update(ivSource).digest();
    md5Bytes[6] &= 0x0f; /* clear version        */
    md5Bytes[6] |= 0x30; /* set to version 3     */
    md5Bytes[8] &= 0x3f; /* clear variant        */
    md5Bytes[8] |= 0x80; /* set to IETF variant  */
    return md5Bytes;
  }
}

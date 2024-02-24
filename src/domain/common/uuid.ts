/* eslint-disable @typescript-eslint/no-var-requires */
const UuidEncoder = require('uuid-encoder');
const encoder = new UuidEncoder('base36');
import { v4 as uuidv4 } from 'uuid';

export class Id {
  static createUnique(): string {
    return uuidv4();
  }

  static createOTP(): string {
    const readable = Math.random().toString(36).slice(2, 8).toUpperCase();

    if (readable.includes('O') || readable.includes('0')) {
      return Id.createOTP();
    }

    return readable;
  }
}

export class Convert {
  static toBase36(uuidv4: string): string {
    return encoder.encode(uuidv4);
  }
}

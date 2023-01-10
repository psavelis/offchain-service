const UuidEncoder = require('uuid-encoder');
const encoder = new UuidEncoder('base36');
import { v4 as uuidv4 } from 'uuid';

export class Id {
  static createUnique(): string {
    return uuidv4();
  }
}

export class Convert {
  static toBase36(uuidv4: string): string {
    return encoder.encode(uuidv4);
  }
}

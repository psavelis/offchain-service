import {type LoggablePort} from '../../../domain/common/ports/loggable.port';
import Logger from '../../adapters/logging/logger';

export class LoggablePortFactory {
  static instance: LoggablePort;

  static getInstance(): LoggablePort {
    if (!this.instance) {
      this.instance = Logger.getInstance();
    }

    return this.instance;
  }
}

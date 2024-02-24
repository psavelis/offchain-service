/* eslint-disable @typescript-eslint/no-explicit-any */
import Pino, { type Level, type Logger } from 'pino';
import { type LoggablePort } from '../../../domain/common/ports/loggable.port';

export default class PinoLogger implements LoggablePort {
  private readonly logger: Logger;

  constructor(name: string, level: Level) {
    this.logger = Pino({ name, level });
  }

  public debug(msg: string, params?: any): void {
    this.logger.debug(params, msg);
  }

  public info(msg: string, params?: any): void {
    this.logger.info(params, msg);
  }

  public warn(msg: string, params?: any): void {
    this.logger.warn(params, msg);
  }

  public error(error: Error, msg: string, params?: any): void {
    this.logger.error(error, msg, params);
  }
}

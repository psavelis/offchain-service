/* eslint-disable @typescript-eslint/no-explicit-any */
import Pino from 'pino';
import { LoggablePort } from '../../../../domain/common/ports/loggable.port';

export default class PinoLogger implements LoggablePort {
  private readonly logger;

  private static instance: PinoLogger;

  static getInstance(): PinoLogger {
    if (this.instance) {
      return this.instance;
    }

    return new this();
  }

  private constructor() {
    const level = process.env.LOG_LEVEL;
    const name = process.env.APP_NAME;

    this.logger = Pino({ name, level });
  }

  public debug(msg: string, params?: any): void {
    this.logger.debug(params, msg);
  }

  public info(msg: string, params?: any): void {
    this.logger.info(params, msg);
  }

  public warning(msg: string, params?: any): void {
    this.logger.warn(params, msg);
  }

  public error(error: Error, msg: string, params?: any): void {
    this.logger.error(error, msg, params);
  }
}

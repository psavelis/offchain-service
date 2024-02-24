/* eslint-disable @typescript-eslint/no-explicit-any */
import { type Level } from 'pino';
import { type LoggablePort } from '../../../domain/common/ports/loggable.port';

import DiscordLogger from './discord-logger';
import PinoLogger from './pino-logger';

export default class Logger implements LoggablePort {
  private static readonly instance: Logger;

  static getInstance(): Logger {
    if (this.instance) {
      return this.instance;
    }

    const level = process.env.LOG_LEVEL as Level;

    const ports: LoggablePort[] = [new PinoLogger(process.env.APP_NAME, level)];

    if (process.env.DISCORD_LOG_WEBHOOK) {
      ports.push(
        new DiscordLogger(
          process.env.APP_NAME,
          process.env.DISCORD_LOG_WEBHOOK,
          (process.env.DISCORD_LOG_LEVEL ?? level) as Level,
        ),
      );
    }

    return new this(ports);
  }

  private constructor(private readonly ports: LoggablePort[]) {}

  public debug(msg: string, params?: any): void {
    for (const port of this.ports) {
      port.debug(msg, params);
    }
  }

  public info(msg: string, params?: any): void {
    for (const port of this.ports) {
      port.info(msg, params);
    }
  }

  public warn(msg: string, params?: any): void {
    for (const port of this.ports) {
      port.warn(msg, params);
    }
  }

  public error(error: Error, msg: string, params?: any): void {
    for (const port of this.ports) {
      port.error(error, msg, params);
    }
  }
}

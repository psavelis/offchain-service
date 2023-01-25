/* eslint-disable @typescript-eslint/no-explicit-any */
import { Level, levels } from 'pino';
import NodeDiscordLogger from 'node-discord-logger';
import { LoggablePort } from '../../../../domain/common/ports/loggable.port';

export default class DiscordLogger implements LoggablePort {
  private readonly logger: NodeDiscordLogger;

  constructor(name: string, hook: string, private level: Level) {
    this.logger = new NodeDiscordLogger({
      serviceName: name,
      hook
    });
  }

  get levelNumber() {
    return levels.values[this.level];
  }

  public debug(msg: string, params?: any): void {
    if (this.levelNumber > levels.values.debug) {
      return;
    }

    this.logger.debug({
      message: msg,
      meta: {
        level: 'Debug'
      },
      json: params
    });
  }

  public info(msg: string, params?: any): void {
    if (this.levelNumber > levels.values.info) {
      return;
    }

    this.logger.info({
      message: msg,
      meta: {
        level: 'Info'
      },
      json: params
    });
  }

  public warning(msg: string, params?: any): void {
    if (this.levelNumber > levels.values.warning) {
      return;
    }

    this.logger.warn({
      message: msg,
      meta: {
        level: 'Warning'
      },
      json: params
    });
  }

  public error(error: Error, msg: string, params?: any): void {
    if (this.levelNumber > levels.values.err) {
      return;
    }

    this.logger.error({
      message: msg,
      meta: {
        level: 'Error'
      },
      error,
      json: params
    });
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import NodeDiscordLogger from 'node-discord-logger';
import { levels, type Level } from 'pino';
import { type LoggablePort } from '../../../domain/common/ports/loggable.port';

const MAX_DISCORD_MESSAGE_LENGTH = 2000;
export default class DiscordLogger implements LoggablePort {
  private readonly nodeDiscordLogger: NodeDiscordLogger;

  constructor(name: string, hook: string, private readonly level: Level) {
    this.nodeDiscordLogger = new NodeDiscordLogger({
      serviceName: name,
      hook,
    });
  }

  get levelNumber() {
    return levels.values[this.level];
  }

  public debug(msg: string, params?: any): void {
    if (this.levelNumber > levels.values.debug) {
      return;
    }

    this.nodeDiscordLogger
      .debug({
        message: DiscordLogger.truncate(msg),
        meta: {
          level: 'Debug',
        },
        json: params,
      })
      .catch(() => {
        console.log(`Msg: ${msg} Params: ${JSON.stringify(params ?? {})}`);
      });
  }

  public info(msg: string, params?: any): void {
    if (this.levelNumber > levels.values.info) {
      return;
    }

    this.nodeDiscordLogger
      .info({
        message: DiscordLogger.truncate(msg),
        meta: {
          level: 'Info',
        },
        json: params,
      })
      .catch(() => {
        console.info(`Msg: ${msg} Params: ${JSON.stringify(params ?? {})}`);
      });
  }

  public warn(msg: string, params?: any): void {
    if (this.levelNumber > levels.values.warning) {
      return;
    }

    this.nodeDiscordLogger
      .warn({
        message: DiscordLogger.truncate(msg),
        meta: {
          level: 'Warning',
        },
        json: params,
      })
      .catch(() => {
        console.warn(`Msg: ${msg} Params: ${JSON.stringify(params ?? {})}`);
      });
  }

  public error(error: Error, msg: string, params?: any): void {
    if (this.levelNumber > levels.values.err) {
      return;
    }

    this.nodeDiscordLogger
      .error({
        message: DiscordLogger.truncate(msg),
        meta: {
          level: 'Error',
        },
        error,
        json: params,
      })
      .catch(() => {
        console.error(
          `Msg: ${JSON.stringify(error.message)} @ Stack: ${JSON.stringify(
            error.stack,
          )} Params: ${JSON.stringify(params ?? {})}`,
        );
      });
  }

  static truncate(string = '') {
    return string.substring(0, MAX_DISCORD_MESSAGE_LENGTH - 512);
  }
}

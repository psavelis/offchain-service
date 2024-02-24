export const Loggable = Symbol('LOGGABLE');

type LogParams = object | object[] | string | string[];
export type LoggablePort = {
  debug(msg: string, params?: LogParams): void;

  info(msg: string, params?: LogParams): void;

  warn(msg: string, params?: LogParams): void;

  error(error: Error, msg: string, params?: LogParams): void;
};

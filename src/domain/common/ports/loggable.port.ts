export const Loggable = Symbol('LOGGABLE');

export interface LoggablePort {
  debug(msg: string, params?: any): void;

  info(msg: string, params?: any): void;

  warning(msg: string, params?: any): void;

  error(error: Error, msg: string, params?: any): void;
}

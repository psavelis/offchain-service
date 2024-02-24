import {type Request, type Response, type NextFunction} from 'express';
import {Injectable, type NestMiddleware} from '@nestjs/common';
import {FakeGatewayExceptionHandler} from '../exception-handler/exception.handler';

export const GlobalExceptionMiddleware = Symbol('GLOBAL_EXCEPTION_MIDDLEWARE');

@Injectable()
export class ExceptionMiddleware implements NestMiddleware {
  private readonly handler;
  constructor() {
    this.handler = new FakeGatewayExceptionHandler();
  }

  use(req: Request, res: Response, next: NextFunction) {
    try {
      next();
    } catch (error) {
      this.handler.handleException(error, res, req);
    }
  }
}

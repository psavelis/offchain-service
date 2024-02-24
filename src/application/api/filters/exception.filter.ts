import {
  Catch,
  type ArgumentsHost,
  type ExceptionFilter,
  type HttpException,
} from '@nestjs/common';
import { FakeGatewayExceptionHandler } from '../exception-handler/exception.handler';

@Catch(Error)
export class ExceptionFilterMiddleware implements ExceptionFilter {
  constructor(
    private readonly gatewayMimicService: FakeGatewayExceptionHandler,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    this.gatewayMimicService.handleException(
      {
        getStatus: undefined,
        getResponse: undefined,
        ...exception,
      },
      response,
      request,
    );
  }
}

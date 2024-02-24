import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

type NestResponse = Response & {
  status?: (status: number) => object & { json: (data: object) => void };
  set?: (header: string, value: string | number) => void;
};

@Injectable()
export class FakeGatewayExceptionHandler {
  handleException(
    exception: Error & {
      getStatus?: () => number;
      getResponse?: () => Error | object;
    },
    response: NestResponse,
    request: Request & {
      params?: object;
      context?: { correlationId?: string };
    },
  ) {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception?.getResponse
      ? exception.getResponse()
      : exception;

    const gatewayResponse = {
      message: 'An error occurred',
      error: {
        code: status,
        message: HttpStatus[status],
        innerMessage:
          errorMessages.get(status) ||
          '"Your request could not be processed. Please check and try again..."',
        details:
          process.env.DISPLAY_HTTP_ERRORS === 'true' &&
          (process.env.NODE_ENV === 'development' ||
            (process.env.NODE_ENV === 'production' &&
              process.env.ALLOW_DEBUG_PROD === 'true'))
            ? exceptionResponse
            : {
                redacted: true,
                support:
                  'https://discord.com/invite/aNQKzUzh?utm_source=Server%20Error&utm_medium=Onboarding%20Tech&utm_campaign=Bug%20Bounty%20KNN',
                context: request?.context?.correlationId,
              },
      },
      _links: {
        self: {
          href: request?.url,
        },
      },
    };

    this.setMimicKongHeaders(response);

    console.error(
      JSON.stringify({
        type: 'ExceptionHandler',
        status,
        context: request.context,
        url: request?.url,
        parameters: request?.params,
        exceptionResponse,
        gatewayResponse,
      }),
    );

    response?.status(status).json(gatewayResponse);
  }

  setMimicKongHeaders = (response: NestResponse) => {
    const fakeLatency = this.getFakeLat();

    response?.set(
      'X-Kong-Response-Latency',
      parseInt(fakeLatency.toString(), 10),
    );
    response?.set(
      'X-Kong-Upstream-Latency',
      parseInt((fakeLatency / 2).toString(), 10),
    );
    response?.set(
      'X-Kong-Proxy-Latency',
      parseInt((fakeLatency / 3).toString(), 10),
    );
    response?.set('Via', '1.1 Kong Gateway');
  };

  getFakeLat = () => {
    return Math.floor(Math.random() * 10) + 1;
  };
}

const errorMessages = new Map<number, string>([
  [HttpStatus.NOT_FOUND, 'The resource was not found.'],
  [
    HttpStatus.BAD_REQUEST,
    'The request was invalid. Please check and try again.',
  ],
  [HttpStatus.FORBIDDEN, 'Access to the resource is denied.'],
  [HttpStatus.UNAUTHORIZED, 'Authentication is required to proceed.'],
  [
    HttpStatus.TOO_MANY_REQUESTS,
    '👾🔨 "Whoa there, fellow keyboard warrior! Your request has been put on a brief intermission.' +
      'Our server hamsters are spinning the wheels as fast as they can! Please hold off on the hacky hacky until further notice. Retry after grabbing a coffee... or maybe two." ☕️⏳',
  ],
  [HttpStatus.NOT_IMPLEMENTED, 'This feature is under development.'],
  [
    HttpStatus.SERVICE_UNAVAILABLE,
    'The server is currently unavailable. Please check back later.',
  ],
  [HttpStatus.GATEWAY_TIMEOUT, 'The server did not receive a timely response.'],
  [HttpStatus.REQUEST_TIMEOUT, 'The server timed out waiting for the request.'],
  [
    HttpStatus.UNPROCESSABLE_ENTITY,
    'The server cannot process the request as is.',
  ],
]);

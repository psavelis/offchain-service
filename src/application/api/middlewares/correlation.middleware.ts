import {Injectable, type NestMiddleware} from '@nestjs/common';
import {type Request, type Response} from 'express';
import {v4 as uuidv4} from 'uuid';
import Ajv from 'ajv';

const requestIdHeader = 'x-request-id';
const correlationIdHeader = 'x-correlation-id';
type Context = {context?: {correlationId?: string; requestId?: string}};

type RequestWithContext = Request & Context;

@Injectable()
export class CorrelationMiddleware implements NestMiddleware {
  private readonly ajv: Ajv;
  private readonly uuidSchema: {type: string; format: string};

  constructor() {
    this.ajv = new Ajv({allErrors: true, useDefaults: true, verbose: true});
    this.uuidSchema = {type: 'string', format: 'uuid'};
  }

  use(req: RequestWithContext, res: Response, next: () => void) {
    try {
      const requestId = uuidv4();
      res.setHeader(requestIdHeader, requestId);

      let correlationId = req.headers[correlationIdHeader] || requestId;

      if (correlationId !== requestId) {
        if (this.ajv.validate(this.uuidSchema, correlationId)) {
          res.setHeader(correlationIdHeader, correlationId);
        } else {
          correlationId = requestId;
        }
      }

      req.context = {
        ...(req.context ?? {}),
        requestId,
        correlationId,
      };
    } finally {
      next();
    }
  }
}

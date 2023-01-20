import { Clearing } from '../../../../../domain/clearing/entities/clearing.entity';
import {
  FetchableStatementPort,
  StatementParameter,
} from '../../../../../domain/clearing/ports/fetchable-statement.port';
import { Statement } from '../../../../../domain/clearing/value-objects/statement.value-object';
import * as https from 'https';
import { PagedStatementDto, StatementTransaction } from './paged-statement.dto';
import { Settings } from '../../../../../domain/common/settings';
import { Transaction } from '../../../../../domain/clearing/value-objects/transaction.value-object';
import { LoggablePort } from '../../../../../domain/common/ports/loggable.port';

const STREAM_SIZE = 200;
const DEFAULT_START_OFFSET_MS = 1_000 * 3 * 60 ** 2;
const FIRST_PAGE_INDEX = 0;

interface OAuthToken {
  access_token: string;
  expires_in: Date;
}

const tokenClockSkew = 60;
const operationType = 'C';
const transactionType = 'PIX';

export class FetchableStatementHttpAdapter implements FetchableStatementPort {
  static instance: FetchableStatementHttpAdapter;
  private token: OAuthToken;
  private agent: https.Agent;

  constructor(readonly settings: Settings, readonly logger: LoggablePort) {}

  static getInstance(
    settings: Settings,
    logger: LoggablePort,
  ): FetchableStatementHttpAdapter {
    if (!FetchableStatementHttpAdapter.instance) {
      FetchableStatementHttpAdapter.instance =
        new FetchableStatementHttpAdapter(settings, logger);
    }

    return FetchableStatementHttpAdapter.instance;
  }

  private async getToken(): Promise<string> {
    if (this.token?.expires_in && this.token?.expires_in > new Date()) {
      return this.token.access_token;
    }

    const headers = {
      ['Content-Type']: 'application/x-www-form-urlencoded',
    };

    const logger = this.logger;

    const {
      hostname,
      clientCert: cert,
      clientKey: key,
    } = this.settings.statementProvider;

    const { path, clientId, clientSecret, scope, grantType } =
      this.settings.oauthProvider;

    const options: https.RequestOptions = {
      method: 'POST',
      port: 443,
      hostname,
      path: `${path}?client_id=${clientId}&client_secret=${clientSecret}&scope=${scope}&grant_type=${grantType}`,
      headers,
      agent: false,
      cert,
      key,
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, function (res) {
        const chunks: any[] = [];

        res.on('error', (err) => {
          logger.error(err, '[statement-oauth] https request error');

          reject(err);
        });

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', function () {
          const body = Buffer.concat(chunks);

          try {
            const { access_token, expires_in } = JSON.parse(body.toString());

            this.token = {
              access_token,
              expires_in: new Date(
                new Date().getTime() + (expires_in - tokenClockSkew) * 1_000,
              ),
            };

            return resolve(access_token);
          } catch (err) {
            logger.error(err, '[statement-oauth] https response parse error');

            reject(err);
          }
        });
      });

      req.end();
    });
  }

  private request(
    pageOffset: number,
    target: string,
    dateOffset: string,
  ): Promise<PagedStatementDto> {
    const logger = this.logger;

    const {
      path: basePath,
      hostname,
      clientCert: cert,
      clientKey: key,
    } = this.settings.statementProvider;

    const path = `${basePath}?pagina=${pageOffset}&tamanhoPagina=${STREAM_SIZE}&dataInicio=${target}&dataFim=${dateOffset}&tipoOperacao=${operationType}&tipoTransacao=${transactionType}`;

    const options = {
      method: 'GET',
      port: 443,
      hostname,
      path,
      headers: {
        authorization: `Bearer ${this.getToken()}`,
      },
      cert,
      key,
      agent: null as https.Agent,
    };

    if (!this.agent) {
      this.agent = new https.Agent(options);
    }

    options.agent = this.agent;

    const paramsDescription = `${target}-${dateOffset} @ page ${pageOffset}`;

    return new Promise((resolve, reject) => {
      const req = https.request(options, function (res) {
        const chunks: any[] = [];

        res.on('error', (err) => {
          logger.error(
            err,
            `[statement-adapter] https-request error: ${paramsDescription}`,
          );

          reject(err);
        });

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', function () {
          const body = Buffer.concat(chunks);

          try {
            const statement: PagedStatementDto = JSON.parse(body.toString());

            return resolve(statement);
          } catch (err) {
            logger.error(
              err,
              `[statement-adapter] parse http-response error: ${paramsDescription}`,
            );

            reject(err);
          }
        });
      });

      req.end();
    });
  }

  getStatementParameter(last: Clearing | undefined): StatementParameter {
    const lastOffset = last?.getOffset();
    const currentDate = new Date();

    const adjustedTarget =
      (lastOffset ? Date.parse(lastOffset) : currentDate.getTime()) -
      DEFAULT_START_OFFSET_MS;

    const target = convertToProviderDateOffset(adjustedTarget);
    const offset = convertToProviderDateOffset(
      currentDate.getTime() + DEFAULT_START_OFFSET_MS,
    );

    return {
      target,
      offset,
    };
  }

  async fetch({ target, offset }: StatementParameter): Promise<Statement> {
    const pagedStatement: PagedStatementDto = await this.request(
      FIRST_PAGE_INDEX,
      target,
      offset,
    );

    return this.parseStatementPage(
      FIRST_PAGE_INDEX,
      target,
      offset,
      pagedStatement,
    );
  }

  async fetchNext(fromStatement: Statement): Promise<Statement> {
    const nextPage = fromStatement.currentPage + 1;
    const pagedStatement: PagedStatementDto = await this.request(
      nextPage,
      fromStatement.target,
      fromStatement.offset,
    );

    return this.parseStatementPage(
      nextPage,
      fromStatement.target,
      fromStatement.offset,
      pagedStatement,
    );
  }

  parseStatementPage(
    pageNumber: number,
    target: string,
    offset: string,
    statement: PagedStatementDto,
  ): Statement {
    try {
      return new Statement(
        pageNumber,
        statement.totalPaginas,
        statement.totalElementos,
        statement.ultimaPagina,
        statement.tamanhoPagina,
        statement.numeroDeElementos,
        target,
        offset,
        statement?.transacoes?.map(
          (t: StatementTransaction) =>
            new Transaction(
              t.idTransacao,
              t.detalhes?.txId,
              t.detalhes?.endToEndId,
              t.valor,
              t.dataInclusao,
              t.dataTransacao,
              t.tipoTransacao,
              t.tipoOperacao,
            ),
        ),
      );
    } catch (err) {
      this.logger.error(
        err,
        `[statement-adapter] parse error: ${target}-${offset} @ page ${pageNumber} (${JSON.stringify(
          statement,
        )})`,
      );

      throw err;
    }
  }
}

const convertToProviderDateOffset = (millis: number): string =>
  new Date(millis).toISOString().split('T')[0];

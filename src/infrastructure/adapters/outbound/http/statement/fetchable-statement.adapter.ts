import { Clearing } from '../../../../../domain/clearing/entities/clearing.entity';
import {
  FetchableStatementPort,
  StatementParameter,
} from '../../../../../domain/clearing/ports/fetchable-statement.port';
import { Statement } from '../../../../../domain/clearing/value-objects/statement.value-object';
import { PagedStatementDto, StatementTransaction } from './paged-statement.dto';
import { Settings } from '../../../../../domain/common/settings';
import { Transaction } from '../../../../../domain/clearing/value-objects/transaction.value-object';
import { LoggablePort } from '../../../../../domain/common/ports/loggable.port';
import https from 'https';

const STREAM_SIZE = 1000;
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
  private agent: any;

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

  public getToken(): Promise<string> {
    if (
      this.token?.expires_in &&
      this.token?.expires_in > new Date() &&
      this.token.access_token
    ) {
      return Promise.resolve(this.token.access_token);
    }

    const { hostname, clientCert, clientKey } = this.settings.statementProvider;
    const { path, clientId, clientSecret, scope, grantType } =
      this.settings.oauthProvider;

    const postData = new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope,
      grant_type: grantType,
    }).toString();

    const options = {
      method: 'POST',
      hostname,
      path,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      maxRedirects: 20,
      cert: Buffer.from(clientCert, 'ascii'),
      key: Buffer.from(clientKey, 'ascii'),
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        const chunks = [];

        res.on('error', (err) => {
          this.logger.error(err, '[statement-oauth] https request error');

          reject(err);
        });

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
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
            this.logger.error(
              err,
              '[statement-oauth] https response parse error',
            );

            reject(err);
          }
        });
      });

      req.setTimeout(1000 * 10);

      req.on('timeout', () => {
        req.destroy(new Error('Request timeout'));
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.write(postData);

      req.end();
    });
  }

  private request(
    token: string,
    pageOffset: number,
    target: string,
    dateOffset: string,
  ): Promise<PagedStatementDto> {
    const {
      path: basePath,
      hostname,
      clientCert,
      clientKey,
    } = this.settings.statementProvider;

    const path = `${basePath}??pagina=${pageOffset}&tamanhoPagina=${STREAM_SIZE}&dataInicio=${target}&dataFim=${dateOffset}&tipoOperacao=${operationType}&tipoTransacao=${transactionType}`;

    const options = {
      method: 'GET',
      port: 443,
      hostname,
      path,
      headers: {
        authorization: `Bearer ${token}`,
      },
      cert: Buffer.from(clientCert, 'ascii'),
      key: Buffer.from(clientKey, 'ascii'),
    };

    if (!this.agent) {
      this.agent = new https.Agent(options);
    }

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        const chunks = [];

        res.on('error', (err) => {
          console.error(err.message, '[statement-oauth] https request error');

          reject(err);
        });

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', () => {
          const body = Buffer.concat(chunks);

          try {
            const statement = JSON.parse(body.toString());

            console.log(
              `[statement-oauth] GET ${path} | Response => Content-Length: ${body?.length}`,
            );

            return resolve(statement);
          } catch (err) {
            console.error(err, '[statement-oauth] https response parse error');

            reject(err);
          } finally {
            req.destroy();
          }
        });
      });

      req.setTimeout(1000 * 10);

      req.on('timeout', () => {
        req.destroy(new Error('Request timeout'));
      });

      req.on('error', (err) => {
        req.destroy(err);
        reject(err);
      });

      req.end();
    });
  }

  getStatementParameter(last: Clearing | undefined): StatementParameter {
    const lastOffset = last?.getOffset();
    const currentDate = new Date();

    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setMonth(currentDate.getMonth() - 1);

    let adjustedTarget = lastOffset
      ? Date.parse(lastOffset)
      : currentDate.getTime() - DEFAULT_START_OFFSET_MS;

    if (adjustedTarget < oneMonthAgo.getTime()) {
      adjustedTarget = oneMonthAgo.getTime();
    }

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
    const token = await this.getToken();
    const pagedStatement: PagedStatementDto = await this.request(
      token,
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

    const token = await this.getToken();
    const pagedStatement: PagedStatementDto = await this.request(
      token,
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
      console.error(
        `[statement-adapter] parse error: ${target}-${offset} @ page ${pageNumber} (${JSON.stringify(
          { statement, msg: err.message, stack: err.stack },
        )})`,
      );

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

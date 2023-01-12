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

export class FetchableStatementHttpAdapter implements FetchableStatementPort {
  constructor(readonly settings: Settings, readonly logger: LoggablePort) {}

  private request(
    pageOffset: number,
    target: string,
    dateOffset: string,
  ): Promise<PagedStatementDto> {
    const logger = this.logger;
    const settings = this.settings;
    return new Promise((resolve, reject) => {
      const options: https.RequestOptions = {
        method: 'GET',
        hostname: settings.statementProvider.hostname,
        path: `${settings.statementProvider.path}?pagina=${pageOffset}&tamanhoPagina=${STREAM_SIZE}&dataInicio=${target}&dataFim=${dateOffset}&tipoOperacao=C&tipoTransacao=PIX`,
        headers: {
          accept: 'application/json',
        },
        agent: false, // TODO: opt+++ => otimização: reuse agent
        cert: settings.statementProvider.clientCert,
        key: settings.statementProvider.clientKey,
      };

      const req = https.request(options, function (res) {
        const chunks: any[] = [];

        res.on('error', (err) => {
          logger.error(
            err,
            `[statement-adapter] http error: ${target}-${dateOffset} @ page ${pageOffset}`, // TODO: logar statusCode do erro etc
          );

          reject(err);
        });

        res.on('data', (chunk) => {
          chunks.push(chunk);
        });

        res.on('end', function () {
          const body = Buffer.concat(chunks);
          const statement: PagedStatementDto = JSON.parse(body.toString());

          return resolve(statement);
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

import { Knex } from 'knex';
import { KnexPostgresDatabase } from '../knex-postgres.db';
import { KnnSummaryDto } from '../../../../../domain/statistics/dtos/knn-summary.dto';
import { FetchableKnnSummaryPort } from '../../../../../domain/statistics/ports/fetchable-knn-summary.port';

export class FetchableKnnSummaryDbAdapter implements FetchableKnnSummaryPort {
  static instance: FetchableKnnSummaryDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): FetchableKnnSummaryPort {
    if (!FetchableKnnSummaryDbAdapter.instance) {
      FetchableKnnSummaryDbAdapter.instance = new FetchableKnnSummaryDbAdapter(
        knexPostgresDb,
      );
    }

    return FetchableKnnSummaryDbAdapter.instance;
  }

  fetch(): Promise<KnnSummaryDto> {
    const journalQuery = `select
        count(*) as totalTransfers,
        count(distinct account) as holdersCount,
        sum(amount) as totalAmount
      from journal
      where iso_code = 'KNN'
      and account_group  = 'HL'`;

    const balanceQuery = `select
      sum(total) filter (where "group" not in ('CN', 'BG'))::int as totalSupply,
      (sum(total) filter (where "group" not in ('TS', 'CN', 'BG')))::int as circulatingSupply
    from balance`;

    const query = `select
      (select totalSupply from (${balanceQuery}) as balance) as total_supply,
      (select circulatingSupply from (${balanceQuery}) as balance) as circulating_supply,
      (select totalTransfers from (${journalQuery}) as journal) as total_transfers,
      (select holdersCount from (${journalQuery}) as journal) as holders_count,
      (select totalAmount from (${journalQuery}) as journal) as total_amount`;

    return this.db()
      .raw(query)
      .then(({ rows }) => {
        const [
          {
            total_supply,
            circulating_supply,
            total_transfers,
            holders_count,
            total_amount,
          },
        ] = rows;

        return {
          totalSupply: Number(total_supply),
          circulatingSupply: Number(circulating_supply),
          holders: {
            totalTransfers: Number(total_transfers),
            count: Number(holders_count),
            totalAmount: Number(total_amount),
          },
        };
      });
  }
}

import {type Knex} from 'knex';
import {type AuditPoolEvent} from '../../../../../domain/upstream-domains/impactful-cultivation/entities/audit-pool-event.entity';
import {type FetchableAuditPoolStoredEventPort} from '../../../../../domain/upstream-domains/impactful-cultivation/ports/fetchable-audit-pool-event.port';
import {type KnexPostgresDatabase} from '../../knex-postgres.db';
import {NetworkType} from '../../../../../domain/common/enums/network-type.enum';
import {parseRow} from './audit-pool-event.mapper';

const tableName = 'audit_pool_event';
export class FetchableAuditPoolStoredEventDbAdapter
implements FetchableAuditPoolStoredEventPort {
  static instance: FetchableAuditPoolStoredEventDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): FetchableAuditPoolStoredEventPort {
    if (!FetchableAuditPoolStoredEventDbAdapter.instance) {
      FetchableAuditPoolStoredEventDbAdapter.instance =
        new FetchableAuditPoolStoredEventDbAdapter(knexPostgresDb);
    }

    return FetchableAuditPoolStoredEventDbAdapter.instance;
  }

  async fetchByFingerprint(
    fingerprint: string,
  ): Promise<AuditPoolEvent | undefined> {
    const query = `select * from ${tableName} where fingerprint = :fingerprint`;

    const records = await this.db().raw(query, {fingerprint});

    if (!records?.length) {
      return;
    }

    return parseRow(records[0]);
  }

  async fetchByBlockNumber(
    ethereumLastBlock: number,
    polygonLastBlock: number,
  ): Promise<AuditPoolEvent[]> {
    const isProd = process.env.NODE_ENV === 'production';
    const query = `select * from ${tableName} where (chain_id = :l1 and block_number > :l1block) or (chain_id = :l2 and block_number > :l2block)`;

    const param = {
      l1: isProd ? NetworkType.Ethereum : NetworkType.EthereumSepolia,
      l2: isProd ? NetworkType.Polygon : NetworkType.PolygonMumbai,
      l1block: ethereumLastBlock,
      l2block: polygonLastBlock,
    };

    const records = await this.db().raw(query, param);

    if (!records?.length) {
      return [];
    }

    const results: AuditPoolEvent[] = [];

    for (const rawRoles of records) {
      const role: AuditPoolEvent = parseRow(rawRoles);
      results.push(role);
    }

    return results;
  }

  async fetchLastBlocks(): Promise<{
		ethereumLastBlock: number;
		polygonLastBlock: number;
	}> {
    const isProd = process.env.NODE_ENV === 'production';

    const param = {
      l1: isProd ? NetworkType.Ethereum : NetworkType.EthereumSepolia,
      l2: isProd ? NetworkType.Polygon : NetworkType.PolygonMumbai,
    };

    const query = `select
      max(ar.block_number) filter (where ar.chain_id = :l1) as ethereumLastBlock,
      max(ar.block_number) filter (where ar.chain_id = :l2) as polygonLastBlock
    from ${tableName} ar`;

    const {rows: records} = await this.db().raw(query, param);

    if (!records?.length) {
      return {
        ethereumLastBlock: 0,
        polygonLastBlock: 0,
      };
    }

    return {
      ethereumLastBlock: records[0].ethereumlastblock - 1,
      polygonLastBlock: records[0].polygonlastblock - 1,
    };
  }
}

import {type Knex} from 'knex';
import {type KnexPostgresDatabase} from '../../knex-postgres.db';
import {type FetchableRolePort} from '../../../../../domain/upstream-domains/identity/authentication/ports/fetchable-role.port';
import {type Role} from '../../../../../domain/upstream-domains/identity/authentication/entities/role.entity';
import {type RoleType} from '../../../../../domain/upstream-domains/identity/authentication/enums/role-type.enum';
import {NetworkType} from '../../../../../domain/common/enums/network-type.enum';
import {parseRow} from './role.mapper';

const tableName = 'auth_role';
export class FetchableRoleDbAdapter implements FetchableRolePort {
  static instance: FetchableRoleDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  async fetchByFingerprint(fingerprint: string): Promise<Role | undefined> {
    const records = await this.db()
      .table(tableName)
      .select('*')
      .where('fingerprint', fingerprint)
      .limit(1);

    if (!records?.length) {
      return;
    }

    return parseRow(records[0]);
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

  async findByClientIdAndChainId(
    userIdentifier: string,
    chainId: number,
    requestedScopes: RoleType[],
  ): Promise<Role[]> {
    const records = await this.db()
      .table(tableName)
      .select('*')
      .whereIn('role_type', requestedScopes)
      .andWhere('user_identifier', userIdentifier)
      .andWhere('chain_id', chainId);

    if (!records?.length) {
      return [];
    }

    const results: Role[] = [];

    for (const rawRoles of records) {
      const role: Role = parseRow(rawRoles);
      results.push(role);
    }

    return results;
  }

  static getInstance(knexPostgresDb: KnexPostgresDatabase): FetchableRolePort {
    if (!FetchableRoleDbAdapter.instance) {
      FetchableRoleDbAdapter.instance = new FetchableRoleDbAdapter(
        knexPostgresDb,
      );
    }

    return FetchableRoleDbAdapter.instance;
  }
}

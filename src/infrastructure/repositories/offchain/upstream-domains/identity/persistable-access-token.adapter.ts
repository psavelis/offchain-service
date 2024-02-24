import {type Knex} from 'knex';
import {type KnexPostgresDatabase} from '../../knex-postgres.db';
import {type PersistableAccessTokenPort} from '../../../../../domain/upstream-domains/identity/authentication/ports/persistable-access-token.port';
import {type AccessToken} from '../../../../../domain/upstream-domains/identity/authentication/entities/access-token.entity';
import {parseEntity, parseRow} from './access-token.mapper';

const tableName = 'access_token';

export class PersistableAccessTokenDbAdapter
implements PersistableAccessTokenPort {
  static instance: PersistableAccessTokenDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableAccessTokenPort {
    if (!PersistableAccessTokenDbAdapter.instance) {
      PersistableAccessTokenDbAdapter.instance =
        new PersistableAccessTokenDbAdapter(knexPostgresDb);
    }

    return PersistableAccessTokenDbAdapter.instance;
  }

  async create(accessToken: AccessToken): Promise<AccessToken> {
    const [record] = await this.db()
      .table(tableName)
      .insert(parseEntity(accessToken))
      .returning('*');

    const created: AccessToken = parseRow(record);

    return created;
  }
}

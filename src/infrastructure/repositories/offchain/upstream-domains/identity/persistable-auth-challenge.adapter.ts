import {type Knex} from 'knex';
import {type AuthChallenge} from '../../../../../domain/upstream-domains/identity/authentication/entities/auth-challenge.entity';
import {type PersistableAuthChallengePort} from '../../../../../domain/upstream-domains/identity/authentication/ports/persistable-auth-challenge.port';
import {type KnexPostgresDatabase} from '../../knex-postgres.db';
import {parseEntity, parseRow} from './auth-challenge.mapper';

const tableName = 'auth_challenge';

export class PersistableAuthChallengeDbAdapter
implements PersistableAuthChallengePort {
  static instance: PersistableAuthChallengeDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableAuthChallengePort {
    if (!PersistableAuthChallengeDbAdapter.instance) {
      PersistableAuthChallengeDbAdapter.instance =
        new PersistableAuthChallengeDbAdapter(knexPostgresDb);
    }

    return PersistableAuthChallengeDbAdapter.instance;
  }

  async create(authChallenge: AuthChallenge): Promise<AuthChallenge> {
    const [record] = await this.db()
      .table(tableName)
      .insert(parseEntity(authChallenge))
      .returning('*');

    const created: AuthChallenge = parseRow(record);

    return created;
  }
}

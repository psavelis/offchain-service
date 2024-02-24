import {type Knex} from 'knex';
import {type KnexPostgresDatabase} from '../../knex-postgres.db';
import {type FetchableAuthChallengePort} from '../../../../../domain/upstream-domains/identity/authentication/ports/fetchable-auth-challenge.port';
import {
  AuthChallenge,
  type AuthChallengeProps,
} from '../../../../../domain/upstream-domains/identity/authentication/entities/auth-challenge.entity';

const tableName = 'auth_challenge';
export class FetchableAuthChallengeDbAdapter
implements FetchableAuthChallengePort {
  static instance: FetchableAuthChallengeDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): FetchableAuthChallengePort {
    if (!FetchableAuthChallengeDbAdapter.instance) {
      FetchableAuthChallengeDbAdapter.instance =
        new FetchableAuthChallengeDbAdapter(knexPostgresDb);
    }

    return FetchableAuthChallengeDbAdapter.instance;
  }

  async findByChallengeId(
    challengeId: string,
  ): Promise<AuthChallenge | undefined> {
    const records = await this.db()
      .select([
        'id',
        'user_identifier',
        'grant_type',
        'chain_id',
        'payload',
        'uri',
        'nonce',
        'scope',
        'due_date',
        'client_ip',
        'client_agent',
        'created_at',
      ])
      .from(tableName)
      .where('id', challengeId)
      .limit(1);

    if (!records?.length) {
      return undefined;
    }

    const [rawAuthChallenge] = records;

    const authChallengeProps: AuthChallengeProps = rawAuthChallenge;

    const {id} = rawAuthChallenge;

    const authChallenge = new AuthChallenge(authChallengeProps, id);

    return authChallenge;
  }
}

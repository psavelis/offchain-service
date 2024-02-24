import {type Knex} from 'knex';
import {
  Challenge,
  type ChallengeProps,
} from '../../../../domain/supply/entities/challenge.entity';
import {type PersistableChallengePort} from '../../../../domain/supply/ports/persistable-challenge.port';
import {type KnexPostgresDatabase} from '../knex-postgres.db';
import * as mapper from './challenge-entity.mapper';

const tableName = 'challenge';

export class PersistableChallengeDbAdapter implements PersistableChallengePort {
  static instance: PersistableChallengeDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableChallengePort {
    if (!PersistableChallengeDbAdapter.instance) {
      PersistableChallengeDbAdapter.instance =
        new PersistableChallengeDbAdapter(knexPostgresDb);
    }

    return PersistableChallengeDbAdapter.instance;
  }

  async create(challenge: Challenge): Promise<Challenge> {
    const [record] = await this.db()
      .table(tableName)
      .insert(mapper.parseEntity(challenge))
      .returning('*');

    const claimProps: ChallengeProps = record,
      {id} = record;

    const created = new Challenge(claimProps, id);

    return created;
  }

  async deactivate(deactivationHash: string): Promise<void> {
    const param = {
      deactivationHash,
      deactivatedAt: new Date(),
    };

    await this.db().raw(
      'update "challenge" set deactivated_at = :deactivatedAt where deactivation_hash = :deactivationHash and deactivated_at is null;',
      param,
    );
  }
}

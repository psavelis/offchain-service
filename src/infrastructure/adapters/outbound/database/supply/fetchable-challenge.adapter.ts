import { Knex } from 'knex';
import {
  Challenge,
  ChallengeProps,
} from '../../../../../domain/supply/entities/challenge.entity';
import { FetchableChallengePort } from '../../../../../domain/supply/ports/fetchable-challenge.port';
import { KnexPostgresDatabase } from '../knex-postgres.db';

export class FetchableChallengeDbAdapter implements FetchableChallengePort {
  static instance: FetchableChallengeDbAdapter;
  private db: () => Knex<any, any[]>;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): FetchableChallengePort {
    if (!FetchableChallengeDbAdapter.instance) {
      FetchableChallengeDbAdapter.instance = new FetchableChallengeDbAdapter(
        knexPostgresDb,
      );
    }

    return FetchableChallengeDbAdapter.instance;
  }

  async fetch(verificationHash: string): Promise<Challenge | undefined> {
    if (!verificationHash) {
      return undefined;
    }

    const query = `select "challenge"."id",
    "challenge"."identifier_order_id" as "identifierOrderId",
    "challenge"."client_ip" as "clientIp",
    "challenge"."client_agent" as "clientAgent",
    "challenge"."verification_hash" as "verificationHash",
    "challenge"."deactivation_hash" as "deactivatedAt",
    "challenge"."expires_at" as "expiresAt",
    "challenge"."created_at" as "createdAt"
    from "challenge"
    where "challenge".verification_hash = :verificationHash and "challenge".deactivated_at is null`;

    const param = { verificationHash };

    const { rows: records } = await this.db().raw(query, param);

    if (!records?.length) {
      return undefined;
    }

    const [challengeProps]: ChallengeProps[] = records,
      [{ id }] = records;

    const challenge = new Challenge(challengeProps, id);

    return challenge;
  }
}

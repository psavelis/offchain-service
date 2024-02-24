import {type Knex} from 'knex';
import {
  Answer,
  type AnswerProps,
} from '../../../../domain/supply/entities/answer.entity';
import {type PersistableAnswerPort} from '../../../../domain/supply/ports/persistable-answer.port';
import {type KnexPostgresDatabase} from '../knex-postgres.db';
import * as mapper from './answer-entity.mapper';

const tableName = 'answer';

export class PersistableAnswerDbAdapter implements PersistableAnswerPort {
  static instance: PersistableAnswerDbAdapter;
  private readonly db: () => Knex;

  private constructor(readonly knexPostgresDb: KnexPostgresDatabase) {
    this.db = knexPostgresDb.knex.bind(knexPostgresDb);
  }

  static getInstance(
    knexPostgresDb: KnexPostgresDatabase,
  ): PersistableAnswerPort {
    if (!PersistableAnswerDbAdapter.instance) {
      PersistableAnswerDbAdapter.instance = new PersistableAnswerDbAdapter(
        knexPostgresDb,
      );
    }

    return PersistableAnswerDbAdapter.instance;
  }

  async create(answer: Answer): Promise<Answer> {
    const [record] = await this.db()
      .table(tableName)
      .insert(mapper.parseEntity(answer))
      .returning('*');

    const answerProps: AnswerProps = record,
      {id} = record;

    const created = new Answer(answerProps, id);

    return created;
  }
}

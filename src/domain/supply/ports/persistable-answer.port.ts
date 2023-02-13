import { Answer } from '../entities/answer.entity';

export interface PersistableAnswerPort {
  create(answer: Answer): Promise<Answer>;
}

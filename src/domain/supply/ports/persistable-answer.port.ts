import {type Answer} from '../entities/answer.entity';

export type PersistableAnswerPort = {
	create(answer: Answer): Promise<Answer>;
};

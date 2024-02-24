import {type HealthIndicatorResult} from '@nestjs/terminus';

export type StorageHealthPort = {
	check(): HealthIndicatorResult | PromiseLike<HealthIndicatorResult>;
};

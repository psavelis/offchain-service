import {type HealthCheckPort} from '../ports/health-check.port';

export const HealthCheckInteractor = Symbol('HEALTH_CHECK');

export type HealthCheckInteractor = {
	check(healthCheck: HealthCheckPort): Promise<boolean>;
};

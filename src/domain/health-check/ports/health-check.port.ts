// import { HealthCheckResult, HealthIndicatorFunction } from '@nestjs/terminus';

export type HealthCheckPort = {
  check(healthIndicators: object[]): Promise<{ status: string }>;
};

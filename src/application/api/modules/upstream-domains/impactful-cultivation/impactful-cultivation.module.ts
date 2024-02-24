import { Module } from '@nestjs/common';
import { EvaluationMetricController } from './evaluation-metric.controller';
import { ValidationManifestController } from './validation-manifest.controller';

@Module({
  controllers: [
    ValidationManifestController,
    // ValidationVeredictController,
    EvaluationMetricController,
  ],
})
export class ImpactfulCultivationModule {}

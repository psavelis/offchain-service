import {
  Controller,
  Get,
  NotImplementedException,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RoleType } from '../../../../../domain/upstream-domains/identity/authentication/enums/role-type.enum';

@ApiTags('impactful-cultivation', 'evaluation-metrics')
@Controller('/impactful-cultivation')
export class EvaluationMetricController {
  @Get('/evaluation-metrics')
  @Throttle(10, 60)
  // @UseGuards()
  @ApiOAuth2([RoleType[RoleType.IMPACT_CULTIVATION_VALIDATOR]])
  async getEvaluationMetrics() {}

  @Get('/evaluation-metrics/:metricId')
  @Throttle(10, 60)
  @UseGuards()
  @ApiOAuth2([RoleType[RoleType.IMPACT_CULTIVATION_VALIDATOR]])
  async getEvaluationMetricById() {
    throw new NotImplementedException();
  }

  @Get('/pools/:poolId/benchmarks/:benchmarkId/evaluation-metrics')
  @Throttle(10, 60)
  @ApiOAuth2([RoleType[RoleType.IMPACT_CULTIVATION_VALIDATOR]])
  async createValidationManifests() {}
}

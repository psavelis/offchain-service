import {
  Controller,
  Get,
  NotImplementedException,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOAuth2, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RoleType } from '../../../../../domain/upstream-domains/identity/authentication/enums/role-type.enum';

@ApiTags('webhooks')
@Controller('/impactful-cultivation/workflows')
export class EvaluationMetricController {
  @Post(':workflowId/webhooks')
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

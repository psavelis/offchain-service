import { Controller, Get, Patch, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOAuth2, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RoleType } from '../../../../../domain/upstream-domains/identity/authentication/enums/role-type.enum';

@ApiTags('impactful-cultivation', 'validation-manifest')
@Controller('/impactful-cultivation')
export class ValidationManifestController {
  @Post('/pools/:poolId/benchmarks/:benchmarkId/manifests')
  @Throttle(10, 60)
  @ApiBody({
    required: true,
    description:
      'Creates a new validation manifest for a given pool and benchmark.',
    isArray: false,
  })
  @ApiOAuth2([RoleType[RoleType.IMPACT_CULTIVATION_VALIDATOR]])
  async createValidationManifests() {
    // ...
  }

  @Get('/pools/:poolId/benchmarks/:benchmarkId/manifests')
  @Throttle(10, 60)
  @UseGuards()
  @ApiOAuth2([RoleType[RoleType.IMPACT_CULTIVATION_VALIDATOR]])
  async getValidationManifests() {
    // ...
  }

  @Get('/pools/:poolId/benchmarks/:benchmarkId/manifests/:manifestId')
  @Throttle(10, 60)
  @UseGuards()
  @ApiOAuth2([RoleType[RoleType.IMPACT_CULTIVATION_VALIDATOR]])
  async getValidationManifestById() {
    // ...
  }

  @Patch('/:poolId/benchmarks/:benchmarkId/manifests/:manifestId')
  @Throttle(10, 60)
  @ApiBody({
    required: true,
    description: 'Edit a validation manifest.',
    isArray: false,
  })
  @ApiOAuth2([RoleType[RoleType.IMPACT_CULTIVATION_VALIDATOR]])
  async editValidationManifests() {
    // ...
  }

  @Put('/:poolId/benchmarks/:benchmarkId/manifests/:manifestId')
  @Throttle(10, 60)
  @ApiBody({
    required: true,
    description: 'Commit a validation manifest.',
    isArray: false,
  })
  @ApiOAuth2([RoleType[RoleType.IMPACT_CULTIVATION_VALIDATOR]])
  async commitValidationManifests() {
    // ...
  }
}

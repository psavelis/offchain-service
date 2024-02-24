import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiOAuth2, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { RoleType } from '../../../../../domain/upstream-domains/identity/authentication/enums/role-type.enum';

@ApiTags('impactful-cultivation', 'validation-veredict')
@Controller('/impactful-cultivation')
export class ValidationVeredictController {
  // @Post('/pools/:poolId/benchmarks/:benchmarkId/veredicts')
  // @Throttle(10, 60)
  // @ApiBody({
  //   // type: => ids dos manifestos a serem enviados
  //   required: true,
  //   description:
  //     'Submits a veredict from validator for a given audit pool and validation benchmark.',
  //   isArray: false,
  // })
  // @ApiOAuth2([RoleType[RoleType.IMPACT_CULTIVATION_VALIDATOR]])
  // async createValidationManifests() {
  //   // ...
  // }

  @Get('/pools/:poolId/veredicts')
  @Throttle(10, 60)
  @UseGuards()
  @ApiOAuth2([RoleType[RoleType.IMPACT_CULTIVATION_VALIDATOR]])
  async getValidationManifests() {
    // ...
  }
}

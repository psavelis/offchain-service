import {
  Body,
  Controller,
  Inject,
  Ip,
  Patch,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  Loggable,
  LoggablePort,
} from '../../../../../../domain/common/ports/loggable.port';
import { MinimalSignedClaim } from '../../../../../../domain/supply/dtos/signed-claim.dto';
import { ClaimLockedSupplyDto } from '../../../../../../domain/supply/dtos/claim-locked-supply.dto';
import {
  ClaimLockedSupply,
  ClaimLockedSupplyInteractor,
} from '../../../../../../domain/supply/interactors/claim-locked-supply.interactor';

@Controller('supply')
export class SupplyController {
  constructor(
    @Inject(ClaimLockedSupply)
    readonly claimLockedSupply: ClaimLockedSupplyInteractor,
    @Inject(Loggable)
    private logger: LoggablePort,
  ) {}

  @Put('claim')
  @Throttle(10, 60)
  async putClaim(
    @Query('EA') base64EmailAddress: string,
    @Req() req,
    @Ip() ip,
  ) {
    try {
      const claimLockedSupplyDto: ClaimLockedSupplyDto = {
        clientAgent: req?.headers['user-agent'],
        clientIp: ip,
        emailAddress: Buffer.from(base64EmailAddress, 'base64').toString(
          'utf8',
        ),
      };

      await this.claimLockedSupply
        .executeChallenge(claimLockedSupplyDto)
        .catch((err) => {
          this.logger.error(err, '[500] PUT /supply/claim');

          throw err;
        });
    } catch (err) {
      console.log(
        `putClaim ${SupplyController.name}, [${ip}@${req?.headers['user-agent']}], ${err.message} - ${err.stack} - entry: ${base64EmailAddress}`,
      );
      this.logger.debug(err, '[400] PUT /supply/claim');
    }
  }

  @Patch('claim')
  @Throttle(10, 60)
  async patchClaim(
    @Query('EA') base64EmailAddress: string,
    @Body() { code, cw }: { code: string; cw: string },
    @Req() req,
    @Ip() ip,
  ) {
    try {
      const claimLockedSupplyDto: ClaimLockedSupplyDto = {
        clientAgent: req?.headers['user-agent'],
        clientIp: ip,
        emailAddress: Buffer.from(base64EmailAddress, 'base64').toString(
          'utf8',
        ),
        code,
        cryptoWallet: cw,
      };

      const result: MinimalSignedClaim[] = await this.claimLockedSupply
        .validateAnswer(claimLockedSupplyDto)
        .then((res) => res)
        .catch((err) => this.logger.error(err, '[500] PATCH /supply/claim'));

      return result;
    } catch (err) {
      console.log(
        `patchClaim ${SupplyController.name}, [${ip}@${req?.headers['user-agent']}], ${err.message}`,
      );
      this.logger.debug(err, '[400] PATCH /supply/claim ');
    }
  }
}

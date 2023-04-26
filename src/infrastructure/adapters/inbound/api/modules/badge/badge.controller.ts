import {
  Body,
  Controller,
  Inject,
  Post,
  UnprocessableEntityException,
  Req,
  Ip,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  SignMint,
  SignMintInteractor,
} from '../../../../../../domain/badge/interactors/sign-mint.interactor';
import { VerifyMint } from '../../../../../../domain/badge/interactors/verify-mint-request.interactor';
import { VerifyMintInteractor } from '../../../../../../domain/badge/interactors/verify-mint-request.interactor';
import { VerifyMintRequestDto } from '../../../../../../domain/badge/dtos/verify-mint-request.dto';
import { ClientBase } from 'pg';

@Controller('badge')
export class BadgeController {
  constructor(
    @Inject(VerifyMint)
    readonly verifyPreSaleMint: VerifyMintInteractor,
    @Inject(SignMint)
    readonly signPreSaleMint: SignMintInteractor,
  ) {}

  @Post('presale/verify')
  @Throttle(6, 60)
  verifyMint(@Body() entry: VerifyMintRequestDto, @Req() req, @Ip() ip) {
    let clientAgent = 'unknown';
    try {
      clientAgent = req?.headers['user-agent'];

      return this.verifyPreSaleMint.execute(entry);
    } catch (error) {
      console.log(
        `verifyMint(presale) ${BadgeController.name}, [${ip}@${clientAgent}], ${error.message}`,
      );
      throw new UnprocessableEntityException('Bad verify request');
    }
  }

  @Post('presale/sign')
  @Throttle(5, 60)
  signMint(@Body() entry: VerifyMintRequestDto, @Req() req, @Ip() ip) {
    let clientAgent = 'unknown';
    try {
      return this.signPreSaleMint.execute({
        ...entry,
        clientIp: ip,
        clientAgent,
      });
    } catch (error) {
      console.log(
        `verifyMint(presale) ${BadgeController.name}, [${ip}@${clientAgent}], ${error.message}`,
      );
      throw new UnprocessableEntityException('Bad verify request');
    }
  }
}

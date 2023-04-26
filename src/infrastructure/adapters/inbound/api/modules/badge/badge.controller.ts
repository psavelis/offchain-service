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

@Controller('badge')
export class BadgeController {
  constructor(
    @Inject(VerifyMint)
    readonly verifyPreSaleMint: VerifyMintInteractor,
    @Inject(SignMint)
    readonly signPreSaleMint: SignMintInteractor,
  ) {}

  @Post('presale/verify')
  @Throttle(5, 60)
  verifyMint(@Body() entry: VerifyMintRequestDto, @Req() req, @Ip() ip) {
    try {
      return this.verifyPreSaleMint.execute(entry);
    } catch (error) {
      console.log(
        `verifyMint(presale) ${BadgeController.name}, [${ip}@${req?.headers['user-agent']}], ${error.message}`,
      );
      throw new UnprocessableEntityException('Bad verify request');
    }
  }
}

import {
  Body,
  Controller,
  Inject,
  Post,
  UnprocessableEntityException,
  Req,
  Ip,
  Get,
  Query,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  SignMint,
  SignMintInteractor,
} from '../../../../../../domain/badge/interactors/sign-mint.interactor';
import { VerifyMint } from '../../../../../../domain/badge/interactors/verify-mint-request.interactor';
import { VerifyMintInteractor } from '../../../../../../domain/badge/interactors/verify-mint-request.interactor';
import { SignMintRequestDto } from 'src/domain/badge/dtos/sign-mint-request.dto';

@Controller('badge')
export class BadgeController {
  constructor(
    @Inject(VerifyMint)
    readonly verifyPreSaleMint: VerifyMintInteractor, // TODO: será substituído pela factory, por enquanto chamando direto um Usecase Interactor específico
    @Inject(SignMint)
    readonly signPreSaleMint: SignMintInteractor,
  ) {}

  @Get('')
  @Throttle(3, 60)
  async getBadges(
    @Query('CW') base64CryptoWallet: string,
    @Req() req,
    @Ip() ip,
  ) {
    let clientAgent = 'unknown';
    try {
      clientAgent = req?.headers['user-agent'];

      const cryptoWallet = Buffer.from(base64CryptoWallet, 'base64').toString(
        'utf8',
      );

      const badge = await this.verifyPreSaleMint.execute({
        cryptoWallet,
      });

      return [badge];
    } catch (error) {
      console.log(
        `getBadges ${BadgeController.name}, [${ip}@${clientAgent}], ${error.message}`,
      );
      throw new UnprocessableEntityException('Bad verify request');
    }
  }

  @Post('sign')
  @Throttle(3, 60)
  async signMint(
    @Body() { cryptoWallet, referenceMetadataId }: SignMintRequestDto,
    @Req() req,
    @Ip() ip,
  ) {
    let clientAgent = 'unknown';

    try {
      clientAgent = req?.headers['user-agent'];

      const res = await this.signPreSaleMint.execute({
        cryptoWallet,
        referenceMetadataId,
        clientIp: ip,
        clientAgent,
      });

      return res;
    } catch (error) {
      console.log(
        `signMint ${BadgeController.name}, [${ip}@${clientAgent}], ${error.message}`,
      );

      throw new UnprocessableEntityException('Bad sign request');
    }
  }
}

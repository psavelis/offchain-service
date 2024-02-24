import {
  Body,
  Controller,
  Get,
  Inject,
  Ip,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UnprocessableEntityException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import {
  FetchAggregatedBadgeEligibility,
  FetchAggregatedBadgeEligibilityInteractor,
} from 'src/domain/badge/interactors/fetch-aggregated-badge-eligibility.interactor';
import {
  FetchBadgeSignature,
  FetchBadgeSignatureInteractor,
} from 'src/domain/badge/interactors/fetch-badge-signature.interactor';
import { SignMintRequestDto } from '../../../../domain/badge/dtos/sign-mint-request.dto';
import {
  SignMint,
  SignMintInteractor,
} from '../../../../domain/badge/interactors/sign-mint.interactor';

@ApiTags('badges')
@Controller('/badges')
export class BadgeController {
  constructor(
    @Inject(SignMint)
    readonly signPreSaleMint: SignMintInteractor,
    @Inject(FetchBadgeSignature)
    readonly fetchBadgeSignature: FetchBadgeSignatureInteractor,
    @Inject(FetchAggregatedBadgeEligibility)
    readonly fetchAggregatedBadgeEligibility: FetchAggregatedBadgeEligibilityInteractor,
  ) {}

  @Get('')
  @Throttle(10, 60)
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

      const badges = await this.fetchAggregatedBadgeEligibility.executeAll(
        cryptoWallet,
      );

      return badges;
    } catch (error) {
      console.log(
        `getBadges ${BadgeController.name}, [${ip}@${clientAgent}], ${error.message} | b64:${base64CryptoWallet}`,
      );
      throw new UnprocessableEntityException('Bad fetch-badges request');
    }
  }

  @Get('/:referenceMetadataId/signature')
  @Throttle(10, 60)
  async getSignature(
    @Query('CW') base64CryptoWallet: string,
    @Param('referenceMetadataId', new ParseIntPipe())
    referenceMetadataId: number,
    @Param('chainId')
    chainId: string | number,
    @Req()
    req,
    @Ip() ip,
  ) {
    let clientAgent = 'unknown';
    try {
      clientAgent = req?.headers['user-agent'];

      const cryptoWallet = Buffer.from(base64CryptoWallet, 'base64').toString(
        'utf8',
      );

      const sig = await this.fetchBadgeSignature.execute(
        cryptoWallet,
        referenceMetadataId,
        ip,
        clientAgent,
        chainId ? parseInt(Number(chainId).toString(), 10) : undefined,
      );

      return sig || {};
    } catch (error) {
      console.log(
        `getSignature ${BadgeController.name}, [${ip}@${clientAgent}], ${error.message} | b64: ${base64CryptoWallet} referenceMetadataId: ${referenceMetadataId}`,
      );
      throw new UnprocessableEntityException('bad fetch-sign request');
    }
  }

  @Post('/:referenceMetadataId/signature')
  @Throttle(3, 60)
  async signMint(
    @Body() { cryptoWallet, chainId }: SignMintRequestDto,
    @Param('referenceMetadataId', new ParseIntPipe())
    referenceMetadataId: number,
    @Req() req,
    @Ip() ip,
  ) {
    let clientAgent = 'unknown';

    try {
      clientAgent = req?.headers['user-agent'];

      const res = await this.signPreSaleMint.execute({
        cryptoWallet,
        referenceMetadataId,
        chainId,
        clientIp: ip,
        clientAgent,
      });

      return res;
    } catch (error) {
      console.log(
        `signMint ${BadgeController.name}, [${ip}@${clientAgent}], ${error.message}`,
      );

      throw new UnprocessableEntityException('bad sign request');
    }
  }
}

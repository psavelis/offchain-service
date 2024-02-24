import { Body, Controller, Inject, Ip, Post, Req } from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CreateAuthChallengeDto } from '../../../../domain/upstream-domains/identity/authentication/dtos/create-auth-challenge.dto';
import { GenerateTokenRequestDto } from '../../../../domain/upstream-domains/identity/authentication/dtos/generate-token-request.dto';
import {
  GenerateAuthChallenge,
  GenerateAuthChallengeInteractor,
} from '../../../../domain/upstream-domains/identity/authentication/interactors/generate-auth-challenge.interactor';
import {
  GenerateAuthToken,
  GenerateAuthTokenInteractor,
} from '../../../../domain/upstream-domains/identity/authentication/interactors/generate-auth-token.interactor';
import { Context } from '../../decorators/context.decorator';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(
    @Inject(GenerateAuthChallenge)
    readonly generateAuthChallenge: GenerateAuthChallengeInteractor,
    @Inject(GenerateAuthToken)
    readonly generateAuthTokenInteractor: GenerateAuthTokenInteractor,
  ) {}

  @Post('challenge')
  @Throttle(10, 60)
  @ApiBody({
    type: CreateAuthChallengeDto,
    required: true,
    description: 'Create a new authentication challenge.',
    isArray: false,
  })
  async postAuthChallenge(
    @Body() entry: CreateAuthChallengeDto,
    @Req() req,
    @Ip() ip,
    @Context() context,
  ) {
    let clientAgent = 'unknown';
    try {
      clientAgent = req?.headers['user-agent'];

      const respose = await this.generateAuthChallenge.execute({
        clientId: entry.clientId,
        chainId: entry.chainId,
        scope: entry.scope,
        uri: entry.uri,
        grantType: entry.grantType,
        clientIp: ip,
        clientAgent,
      });

      return respose;
    } catch (error) {
      console.error(
        `postAuthChallenge ${AuthController.name}, [${ip}@${clientAgent}], ${
          error.message
        }, ${error.stack}, ${JSON.stringify(context)} | clientId: '${
          entry.clientId
        }' chainId: '${entry.chainId}' scope: '${entry.scope}'`,
      );

      return [];
    }
  }

  @Post('token')
  @Throttle(10, 60)
  @ApiBody({
    type: GenerateTokenRequestDto,
    required: true,
    description: 'Create a new access token.',
    isArray: false,
  })
  async postAuthToken(
    @Body() entry: GenerateTokenRequestDto,
    @Req() req,
    @Ip() ip,
  ) {
    let clientAgent = '';
    try {
      clientAgent = req?.headers['user-agent'];

      const respose = await this.generateAuthTokenInteractor.execute({
        clientId: entry.clientId,
        chainId: entry.chainId,
        challengeId: entry.challengeId,
        signature: entry.signature,
        clientIp: ip,
        clientAgent,
      });

      return respose;
    } catch (error) {
      console.error(
        `postAuthToken ${AuthController.name}, [${ip}@${clientAgent}], ${error.message} | clientId: '${entry.clientId}' chainId: '${entry.chainId}' challengeId: '${entry.challengeId}' signature: '${entry.signature}'`,
      );

      return [];
    }
  }
}

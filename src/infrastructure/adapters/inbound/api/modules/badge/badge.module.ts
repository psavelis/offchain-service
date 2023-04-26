import { Module, Scope } from '@nestjs/common';
import { VerifyPreSaleMintFactory } from '../../../../../factories/badge/verify-presale-mint.factory';
import { SignPreSaleMintFactory } from '../../../../../factories/badge/sign-presale-mint.factory';
import { BadgeController } from './badge.controller';
import { VerifyMint } from '../../../../../../domain/badge/interactors/verify-mint-request.interactor';
import { SignMint } from '../../../../../../domain/badge/interactors/sign-mint.interactor';

@Module({
  controllers: [BadgeController],
  providers: [
    {
      provide: VerifyMint,
      useFactory: VerifyPreSaleMintFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: SignMint,
      useFactory: SignPreSaleMintFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class BadgeModule {}

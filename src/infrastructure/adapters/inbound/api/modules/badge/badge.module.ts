import { Module, Scope } from '@nestjs/common';
import { VerifyPreSaleMintFactory } from '../../../../../factories/badge/verify-presale-mint.factory';
import { SignPreSaleMintFactory } from '../../../../../factories/badge/sign-presale-mint.factory';
import { BadgeController } from './badge.controller';
import { VerifyMint } from '../../../../../../domain/badge/interactors/verify-mint-request.interactor';
import { SignMint } from '../../../../../../domain/badge/interactors/sign-mint.interactor';
import { FetchBadgeSignature } from '../../../../../../domain/badge/interactors/fetch-badge-signature.interactor';
import { FetchBadgeEligibility } from '../../../../../../domain/badge/interactors/fetch-badge-eligibility.interactor';
import { FetchPreSaleSignatureFactory } from '../../../../../factories/badge/fetch-presale-signature.factory';
import { FetchPreSaleBadgeEligibilityFactory } from '../../../../../factories/badge/fetch-presale-badge-eligibility.factory';

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
    {
      provide: FetchBadgeSignature,
      useFactory: FetchPreSaleSignatureFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: FetchBadgeEligibility,
      useFactory: FetchPreSaleBadgeEligibilityFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class BadgeModule {}

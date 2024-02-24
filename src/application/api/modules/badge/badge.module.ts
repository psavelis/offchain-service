import {Module, Scope} from '@nestjs/common';
import {BadgeController} from './badge.controller';
import {VerifyMint} from '../../../../domain/badge/interactors/verify-mint-request.interactor';
import {SignMint} from '../../../../domain/badge/interactors/sign-mint.interactor';
import {FetchBadgeSignature} from '../../../../domain/badge/interactors/fetch-badge-signature.interactor';
import {FetchAggregatedBadgeEligibility} from '../../../../domain/badge/interactors/fetch-aggregated-badge-eligibility.interactor';
import {FetchAggregatedBadgeEligibilityFactory} from '../../../../infrastructure/factories/badge/aggregators/fetch-aggregated-badge-eligibility.factory';
import {VerifyAggregatedBadgeMintFactory} from '../../../../infrastructure/factories/badge/aggregators/verify-aggregated-badge-mint.factory';
import {SignAggregatedMintFactory} from '../../../../infrastructure/factories/badge/aggregators/sign-aggregated-mint.factory';
import {FetchAggregatedSignatureFactory} from '../../../../infrastructure/factories/badge/aggregators/fetch-aggregated-signature.factory';

@Module({
  controllers: [BadgeController],
  providers: [
    {
      provide: VerifyMint,
      useFactory: VerifyAggregatedBadgeMintFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: SignMint,
      useFactory: SignAggregatedMintFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: FetchBadgeSignature,
      useFactory: FetchAggregatedSignatureFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: FetchAggregatedBadgeEligibility,
      useFactory: FetchAggregatedBadgeEligibilityFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class BadgeModule {}

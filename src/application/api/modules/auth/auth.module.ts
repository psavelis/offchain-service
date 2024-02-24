import {Module, Scope} from '@nestjs/common';
import {AuthController} from './auth.controller';
import {GenerateAuthChallenge} from '../../../../domain/upstream-domains/identity/authentication/interactors/generate-auth-challenge.interactor';
import {GenerateAuthToken} from '../../../../domain/upstream-domains/identity/authentication/interactors/generate-auth-token.interactor';
import {GenerateAuthChallengeFactory} from '../../../../infrastructure/factories/auth/generate-auth-challenge.factory';
import {GenerateAuthTokenFactory} from '../../../../infrastructure/factories/auth/generate-auth-token.factory';
import {GenerateFingerprint} from '../../../../domain/upstream-domains/identity/authentication/interactors/generate-fingerprint.interactor';
import {ImportPoolEvents} from '../../../../domain/upstream-domains/impactful-cultivation/interactors/import-pool-events.interactor';
import {GenerateAuditFingerprintFactory} from '../../../../infrastructure/factories/upstream-domains/impactful-cultivation/generate-audit-fingerprint.factory';
import {ImportPoolEventsFactory} from '../../../../infrastructure/factories/upstream-domains/impactful-cultivation/import-pool-events.factory';
@Module({
  controllers: [AuthController],
  providers: [
    {
      provide: GenerateAuthChallenge,
      useFactory: GenerateAuthChallengeFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: GenerateAuthToken,
      useFactory: GenerateAuthTokenFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: GenerateFingerprint,
      useFactory: GenerateAuditFingerprintFactory.getInstance,
      scope: Scope.DEFAULT,
    },
    {
      provide: ImportPoolEvents,
      useFactory: ImportPoolEventsFactory.getInstance,
      scope: Scope.DEFAULT,
    },
  ],
})
export class AuthModule {}

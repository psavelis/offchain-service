import { Inject, Module, Scope, type OnModuleInit } from '@nestjs/common';
import { CronJob } from 'cron';
import {
  GenerateFingerprint,
  GenerateFingerprintInteractor,
} from '../../../../domain/upstream-domains/identity/authentication/interactors/generate-fingerprint.interactor';
import {
  ImportPoolEvents,
  ImportPoolEventsInteractor,
} from '../../../../domain/upstream-domains/impactful-cultivation/interactors/import-pool-events.interactor';
import { GenerateAuditFingerprintFactory } from '../../../../infrastructure/factories/upstream-domains/impactful-cultivation/generate-audit-fingerprint.factory';
import { ImportPoolEventsFactory } from '../../../../infrastructure/factories/upstream-domains/impactful-cultivation/import-pool-events.factory';

@Module({
  providers: [
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
export class AuthWorkerModule implements OnModuleInit {
  constructor(
		@Inject(GenerateFingerprint)
		readonly generateFingerprint: GenerateFingerprintInteractor,
		@Inject(ImportPoolEvents)
		readonly importPoolEvents: ImportPoolEventsInteractor,
  ) {}

  onModuleInit() {
    this.initializeFingerprintJob();
    this.initializeImportJob();
  }

  private initializeFingerprintJob() {
    const fingerprintsJob = new CronJob('*/35 * * * * *', async () => {
      await this.generateFingerprint.execute();
    });

    fingerprintsJob.start();
  }

  private initializeImportJob() {
    const importJob = new CronJob('*/5 * * * * *', async () => {
      await this.importPoolEvents.execute();
    });

    importJob.start();
  }
}

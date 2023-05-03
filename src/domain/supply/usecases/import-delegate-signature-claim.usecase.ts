import { ImportDelegateSignatureClaimInteractor } from '../interactors/import-delegate-signature-claim.interactor';
import { FetchableDelegateClaimEventPort } from '../ports/fetchable-delegate-claim-event.port';

export class ImportDelegateSignatureClaimUseCase
  implements ImportDelegateSignatureClaimInteractor
{
  constructor(
    readonly fetchableDelegateClaimEventPort: FetchableDelegateClaimEventPort,
  ) {}
  async execute(): Promise<void> {
    const events = await this.fetchableDelegateClaimEventPort.fetch();
  }
}

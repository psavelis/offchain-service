import {
  AuditPoolEvent,
  AuditPoolEventType,
} from '../../dtos/impactful-cultivation/auditpool-event.dto';

export interface FetchableAuditPoolEventPort {
  fetch(
    cryptoWallet: string,
    ...auditPoolEventType: AuditPoolEventType[]
  ): Promise<AuditPoolEvent[]>;
}

import {type AuditPoolRemoteEventDto} from 'src/domain/upstream-domains/impactful-cultivation/dtos/audit-pool-remote-event.dto';
import {type AuditPoolEventType} from '../../../upstream-domains/impactful-cultivation/enums/audit-pool-event.enum';

export type FetchableAuditPoolRemoteEventPort = {
	fetch(
		cryptoWallet: string,
		...auditPoolEventType: AuditPoolEventType[]
	): Promise<AuditPoolRemoteEventDto[]>;
};

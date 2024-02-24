import {type AuditPoolEvent} from '../entities/audit-pool-event.entity';

export type PersistableAuditPoolEventPort = {
	create(auditPoolEvent: AuditPoolEvent): Promise<AuditPoolEvent>;
};

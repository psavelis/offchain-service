export enum AuditPoolEventType {
  INITIALIZED = 'Initialized',
  SCORE_PROVIDER_SET = 'ScoreProviderSet',
  FINALIZED = 'Finalized',
  NEW_STAKE = 'NewStake',
  WITHDRAW = 'Withdraw',
  LEFTOVER_TRANSFERRED = 'LeftoverTransferred',
}

export interface AuditPoolEvent {
  name: AuditPoolEventType;
  transactionHash: string;
  blockTimestamp: number;
}

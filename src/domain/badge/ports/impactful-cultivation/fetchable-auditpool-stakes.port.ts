export interface FetchableAuditPoolStakesPort {
  fetchStakeOf(cryptoWallet: string): Promise<boolean>;
}

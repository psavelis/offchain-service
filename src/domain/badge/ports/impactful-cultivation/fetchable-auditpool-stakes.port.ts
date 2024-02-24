export type FetchableAuditPoolStakesPort = {
	fetchStakeOf(cryptoWallet: string): Promise<boolean>;
};

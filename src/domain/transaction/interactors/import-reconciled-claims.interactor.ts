export const ImportReconciledClaims = Symbol('IMPORT_RECONCILED_CLAIMS');

export type ImportReconciledClaimsInteractor = {
	execute(): Promise<void>;
};

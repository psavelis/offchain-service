export const ImportReconciledClaims = Symbol('IMPORT_RECONCILED_CLAIMS');

export interface ImportReconciledClaimsInteractor {
  execute(): Promise<void>;
}

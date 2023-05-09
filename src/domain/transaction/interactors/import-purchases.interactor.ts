export const ImportPurchases = Symbol('IMPORT_RECONCILED_CLAIMS');

export interface ImportPurchasesInteractor {
  execute(): Promise<void>;
}

export const ImportPurchases = Symbol('IMPORT_RECONCILED_CLAIMS');

export type ImportPurchasesInteractor = {
	execute(): Promise<void>;
};

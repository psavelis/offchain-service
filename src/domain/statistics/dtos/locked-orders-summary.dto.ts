export type LockedOrdersSummaryDto = {
	lockedTokens: {
		totalAmount: number;
		preSale: number;
		sale: number;
		stockOptionPool: number;
	};
};

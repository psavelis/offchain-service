export const CreateSettlement = Symbol('CREATE_SETTLEMENT');

export type CreateSettlementInteractor = {
	execute(): Promise<void>;
};

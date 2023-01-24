export const CreateSettlement = Symbol('CREATE_SETTLEMENT');

export interface CreateSettlementInteractor {
  execute(): Promise<void>;
}

export const ImportPoolEvents = Symbol('IMPORT_POOL_EVENTS');
export type ImportPoolEventsInteractor = {
	execute(): Promise<void>;
};

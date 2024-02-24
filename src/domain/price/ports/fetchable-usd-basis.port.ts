import {type UsdQuoteBasis} from '../value-objects/usd-quote-basis.value-object';

export type FetchableUsdBasisPort = {
	fetch(forceReload?: boolean): Promise<UsdQuoteBasis>;
};

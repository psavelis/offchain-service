import {type EthQuoteBasis} from '../value-objects/eth-quote-basis.value-object';

export type FetchableEthBasisPort = {
	fetch(forceReload?: boolean): Promise<EthQuoteBasis>;
};

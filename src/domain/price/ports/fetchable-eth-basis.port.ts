import { EthQuoteBasis } from '../value-objects/eth-quote-basis.value-object';

export interface FetchableEthBasisPort {
  fetch(): Promise<EthQuoteBasis>;
}

import {type BigNumber} from 'ethers';
import {type FetchableSupplyPort} from '../../../../domain/supply/ports/fetchable-supply.port';
import {type IKannaProtocolProvider} from '../kanna.provider';
import {type KannaPreSale} from '../protocol/contracts';

export class FetchAvailableSupplyAdapter implements FetchableSupplyPort {
  constructor(readonly provider: IKannaProtocolProvider) {}

  async fetch(): Promise<string> {
    const presale: KannaPreSale = await this.provider.sale();

    const response: BigNumber = await presale.availableSupply();

    return response.toString();
  }
}

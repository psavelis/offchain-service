import { BigNumber } from 'ethers';
import { FetchableSupplyPort } from '../../../../../domain/supply/ports/fetchable-supply.port';
import { IKannaProtocolProvider } from '../kanna.provider';
import { KannaPreSale } from '../protocol';

export class FetchAvailableSupplyAdapter implements FetchableSupplyPort {
  constructor(readonly provider: IKannaProtocolProvider) {}

  async fetch(): Promise<string> {
    const presale: KannaPreSale = await this.provider.preSale();

    const response: BigNumber = await presale.availableSupply();

    return response.toString();
  }
}

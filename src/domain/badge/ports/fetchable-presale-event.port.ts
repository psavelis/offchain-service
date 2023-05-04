import { PreSaleEvent, PreSaleEventType } from '../dtos/presale-event.dto';

export interface FetchablePreSaleEventPort {
  fetch(
    cryptoWallet: string,
    ...preSaleEventType: PreSaleEventType[]
  ): Promise<PreSaleEvent[]>;
}

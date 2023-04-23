import { PreSaleEvent, PreSaleEventType } from '../dtos/presale-event.dto';

export interface FetchablePresaleEventPort {
  fetch(
    cryptoWallet: string,
    ...preSaleEventType: PreSaleEventType[]
  ): Promise<PreSaleEvent[]>;
}

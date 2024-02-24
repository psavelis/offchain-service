import {
  type PreSaleEvent,
  type PreSaleEventType,
} from '../../../upstream-domains/presale/dtos/presale-event.dto';

export type FetchablePreSaleEventPort = {
	fetch(
		cryptoWallet: string,
		...preSaleEventType: PreSaleEventType[]
	): Promise<PreSaleEvent[]>;
};

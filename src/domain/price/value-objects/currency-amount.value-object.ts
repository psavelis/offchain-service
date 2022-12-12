export enum IsoCodes {
  BRL = 'BRL',
  ETH = 'ETH',
  KNN = 'KNN',
  USD = 'USD',
};

export type CurrencyIsoCode = `${IsoCodes}`;

export interface CurrencyAmount<T extends CurrencyIsoCode = CurrencyIsoCode> {
  unassignedNumber: string;
  decimals: number;
  isoCode: T;
}

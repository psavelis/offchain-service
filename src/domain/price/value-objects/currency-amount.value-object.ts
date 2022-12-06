export const IsoCodes: Record<CurrencyIsoCode, CurrencyIsoCode> = {
  BRL: 'BRL',
  ETH: 'ETH',
  KNN: 'KNN',
  USD: 'USD',
};

export type CurrencyIsoCode = 'BRL' | 'KNN' | 'ETH' | 'USD';

export interface CurrencyAmount {
  unassignedNumber: string;
  decimals: number;
  isoCode: CurrencyIsoCode;
}

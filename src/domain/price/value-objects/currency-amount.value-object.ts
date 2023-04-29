import { IsoCodeType } from '../../common/enums/iso-codes.enum';

export type CurrencyIsoCode = `${IsoCodeType}`;

export interface CurrencyAmount<T extends CurrencyIsoCode = CurrencyIsoCode> {
  unassignedNumber: string;
  decimals: number;
  isoCode: T;
}

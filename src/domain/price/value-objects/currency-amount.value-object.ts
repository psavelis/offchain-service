import {type IsoCodeType} from '../../common/enums/iso-codes.enum';

export type CurrencyIsoCode = `${IsoCodeType}`;

export type CurrencyAmount<T extends CurrencyIsoCode = CurrencyIsoCode> = {
	unassignedNumber: string;
	decimals: number;
	isoCode: T;
};

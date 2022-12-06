import { FetchableUsdBasisPort } from '../../../../../domain/price/ports/fetchable-usd-basis.port';
import { UsdQuoteBasis } from '../../../../../domain/price/value-objects/usd-quote-basis.value-object';
import { CurrencyAmount } from '../../../../../domain/price/value-objects/currency-amount.value-object';
import fetch from 'node-fetch';

export interface PartnerQuotation {
  USDBRL: UsdBrlFactor;
}

export interface UsdBrlFactor {
  code: string;
  codein: string;
  name: string;
  high: string;
  low: string;
  varBid: string;
  pctChange: string;
  bid: string;
  ask: string;
  timestamp: string;
  create_date: string;
}

const BRL_ISO_CODE = 'BRL';
const USD_QUOTATION_DECIMALS = 4;
const KNOWN_USDBRL_FLOOR = 4;
const KNOWN_USDBRL_CEILING = 7;
const QUOTATION_EXPIRATION_SECONDS = 30;

export class FetchableUsdBasisHttpAdapter implements FetchableUsdBasisPort {
  static instance: FetchableUsdBasisPort;
  private constructor() {}

  static getInstance() {
    if (!FetchableUsdBasisHttpAdapter.instance) {
      FetchableUsdBasisHttpAdapter.instance =
        new FetchableUsdBasisHttpAdapter();
    }

    return FetchableUsdBasisHttpAdapter.instance;
  }

  async fetch(): Promise<UsdQuoteBasis> {
    const quotation = await fetch(
      'https://economia.awesomeapi.com.br/json/last/usd',
    );

    const quotationRoot: PartnerQuotation = await quotation.json();

    if (!this.validatePartnerQuotation(quotationRoot)) {
      throw new Error(
        `Invalid ${BRL_ISO_CODE} quotation (SOURCE:${JSON.stringify(
          quotationRoot,
        )})`,
      );
    }

    const usdQuotation: CurrencyAmount = {
      unassignedNumber: quotationRoot.USDBRL.ask.replace('.', ''),
      decimals: USD_QUOTATION_DECIMALS,
      isoCode: BRL_ISO_CODE,
    };

    if (usdQuotation.unassignedNumber.length !== 5) {
      throw new Error(
        `Invalid ${BRL_ISO_CODE} parsing (AMOUNT:${JSON.stringify(
          usdQuotation,
        )}, SOURCE:${JSON.stringify(quotationRoot)})`,
      );
    }

    return {
      BRL: usdQuotation,
      expiration: new Date(
        new Date().getTime() + QUOTATION_EXPIRATION_SECONDS * 1_000,
      ),
    };
  }

  private validatePartnerQuotation(quotation: PartnerQuotation): boolean {
    if (!quotation.USDBRL.ask.includes('.')) {
      return false;
    }

    if (quotation.USDBRL.ask.includes(',')) {
      return false;
    }

    const quotationValue = parseFloat(quotation.USDBRL.ask);
    return (
      quotationValue > KNOWN_USDBRL_FLOOR &&
      quotationValue < KNOWN_USDBRL_CEILING
    );
  }
}

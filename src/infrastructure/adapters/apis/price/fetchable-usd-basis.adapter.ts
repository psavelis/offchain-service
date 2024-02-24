import { FetchableUsdBasisPort } from '../../../../domain/price/ports/fetchable-usd-basis.port';
import { UsdQuoteBasis } from '../../../../domain/price/value-objects/usd-quote-basis.value-object';
import { CurrencyAmount } from '../../../../domain/price/value-objects/currency-amount.value-object';
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
const QUOTATION_EXPIRATION_SECONDS = 360;

export class FetchableUsdBasisHttpAdapter implements FetchableUsdBasisPort {
  static instance: FetchableUsdBasisPort;
  static cachedBasis: UsdQuoteBasis | null;

  private constructor() {
    FetchableUsdBasisHttpAdapter.cachedBasis = null;
  }

  static getInstance() {
    if (!FetchableUsdBasisHttpAdapter.instance) {
      FetchableUsdBasisHttpAdapter.instance =
        new FetchableUsdBasisHttpAdapter();
    }

    return FetchableUsdBasisHttpAdapter.instance;
  }

  static getCachedBasis(): UsdQuoteBasis | null {
    if (
      FetchableUsdBasisHttpAdapter.cachedBasis &&
      FetchableUsdBasisHttpAdapter.cachedBasis.expiration > new Date()
    ) {
      return FetchableUsdBasisHttpAdapter.cachedBasis;
    }

    return null;
  }

  async fetch(forceReload: boolean = false): Promise<UsdQuoteBasis> {
    const cached = FetchableUsdBasisHttpAdapter.getCachedBasis();

    if (cached && !forceReload) {
      return cached;
    }

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

    const [integer, decimals] = quotationRoot.USDBRL.ask.split('.');

    const usdQuotation: CurrencyAmount = {
      unassignedNumber: integer + decimals.padEnd(4, '0'),
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

    FetchableUsdBasisHttpAdapter.cachedBasis = {
      BRL: usdQuotation,
      expiration: new Date(
        new Date().getTime() + QUOTATION_EXPIRATION_SECONDS * 1_000,
      ),
    };

    return FetchableUsdBasisHttpAdapter.cachedBasis;
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

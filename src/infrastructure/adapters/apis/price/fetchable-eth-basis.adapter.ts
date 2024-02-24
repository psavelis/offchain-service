import { FetchableEthBasisPort } from '../../../../domain/price/ports/fetchable-eth-basis.port';
import { CurrencyAmount } from '../../../../domain/price/value-objects/currency-amount.value-object';
import fetch from 'node-fetch';
import { EthQuoteBasis } from '../../../../domain/price/value-objects/eth-quote-basis.value-object';

const BRL_ISO_CODE = 'BRL';
const USD_ISO_CODE = 'USD';
const QUOTATION_DECIMALS = 2;
const QUOTATION_PRECISION = 1e2;
const QUOTATION_EXPIRATION_SECONDS = 360;

const KNOWN_ETHBRL_FLOOR = 1_000;
const KNOWN_ETHBRL_CEILING = 100_000;

const KNOWN_ETHUSD_FLOOR = 100;
const KNOWN_ETHUSD_CEILING = 100_000;

export interface PartnerQuotation {
  BRL: number;
  USD: number;
}

export class FetchableEthBasisHttpAdapter implements FetchableEthBasisPort {
  static instance: FetchableEthBasisPort;
  static cachedBasis: EthQuoteBasis | null;

  private constructor() {
    throw new Error(`${FetchableEthBasisHttpAdapter.name} deprecated`);

    FetchableEthBasisHttpAdapter.cachedBasis = null;
  }

  static getInstance(): FetchableEthBasisPort {
    if (!FetchableEthBasisHttpAdapter.instance) {
      FetchableEthBasisHttpAdapter.instance =
        new FetchableEthBasisHttpAdapter();
    }

    return FetchableEthBasisHttpAdapter.instance;
  }

  static getCachedBasis(): EthQuoteBasis | null {
    if (
      FetchableEthBasisHttpAdapter.cachedBasis &&
      FetchableEthBasisHttpAdapter.cachedBasis.expiration > new Date()
    ) {
      return FetchableEthBasisHttpAdapter.cachedBasis;
    }

    return null;
  }

  async fetch(forceReload: boolean = false): Promise<EthQuoteBasis> {
    const cached = FetchableEthBasisHttpAdapter.getCachedBasis();

    if (cached && !forceReload) {
      return cached;
    }

    const quotation = await fetch(
      `https://min-api.cryptocompare.com/data/price?&api_key=${process.env.QUOTES_API_KEY}&fsym=ETH&tsyms=BRL,USD`,
    );

    const quotationRoot: PartnerQuotation = await quotation.json();

    if (!this.validatePartnerBrlQuotation(quotationRoot)) {
      throw new Error(
        `Invalid ${BRL_ISO_CODE} quotation (SOURCE:${JSON.stringify(
          quotationRoot,
        )})`,
      );
    }

    if (!this.validatePartnerUsdQuotation(quotationRoot)) {
      throw new Error(
        `Invalid ${USD_ISO_CODE} quotation (SOURCE:${JSON.stringify(
          quotationRoot,
        )})`,
      );
    }

    const brlQuotation: CurrencyAmount = {
      unassignedNumber: parseInt(
        (quotationRoot.BRL * QUOTATION_PRECISION).toFixed(2),
        10,
      ).toString(),
      decimals: QUOTATION_DECIMALS,
      isoCode: BRL_ISO_CODE,
    };

    if (brlQuotation.unassignedNumber.length < 5) {
      throw new Error(
        `Invalid ${BRL_ISO_CODE} parsing (AMOUNT:${JSON.stringify(
          brlQuotation,
        )}, SOURCE:${JSON.stringify(quotationRoot)})`,
      );
    }

    const usdQuotation: CurrencyAmount = {
      unassignedNumber: parseInt(
        (quotationRoot.USD * QUOTATION_PRECISION).toFixed(2),
        10,
      ).toString(),
      decimals: QUOTATION_DECIMALS,
      isoCode: USD_ISO_CODE,
    };

    if (usdQuotation.unassignedNumber.length < 5) {
      throw new Error(
        `Invalid ${USD_ISO_CODE} parsing (AMOUNT:${JSON.stringify(
          brlQuotation,
        )}, SOURCE:${JSON.stringify(quotationRoot)})`,
      );
    }
    FetchableEthBasisHttpAdapter.cachedBasis = {
      BRL: brlQuotation,
      USD: usdQuotation,
      expiration: new Date(
        new Date().getTime() + QUOTATION_EXPIRATION_SECONDS * 1_000,
      ),
    };

    return FetchableEthBasisHttpAdapter.cachedBasis;
  }

  private validatePartnerBrlQuotation(quotation: PartnerQuotation): boolean {
    return (
      quotation.BRL > KNOWN_ETHBRL_FLOOR && quotation.BRL < KNOWN_ETHBRL_CEILING
    );
  }

  private validatePartnerUsdQuotation(quotation: PartnerQuotation): boolean {
    return (
      quotation.USD > KNOWN_ETHUSD_FLOOR && quotation.BRL < KNOWN_ETHUSD_CEILING
    );
  }
}

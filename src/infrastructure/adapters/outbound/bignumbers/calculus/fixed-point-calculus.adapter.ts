import { CalculusPort } from '../../../../../domain/price/ports/calculus.port';
import {
  CurrencyAmount,
  CurrencyIsoCode,
} from '../../../../../domain/price/value-objects/currency-amount.value-object';
import { BigNumber, FixedNumber, utils } from 'ethers';

const bigNumberDecimals = 18;

export class FixedPointCalculusAdapter implements CalculusPort {
  static instance: CalculusPort;

  private constructor() {}

  static getInstance() {
    if (!FixedPointCalculusAdapter.instance) {
      FixedPointCalculusAdapter.instance = new FixedPointCalculusAdapter();
    }

    return FixedPointCalculusAdapter.instance;
  }

  toFixedNumber({ unassignedNumber, decimals }: CurrencyAmount) {
    const bigNumberish =
      decimals === bigNumberDecimals
        ? unassignedNumber
        : unassignedNumber.padEnd(
            unassignedNumber.length + bigNumberDecimals - decimals,
            '0',
          );

    return FixedNumber.fromValue(
      BigNumber.from(bigNumberish),
      bigNumberDecimals,
      'ufixed128x18',
    );
  }

  toCurrency(
    fixedNumber: FixedNumber,
    decimals: number,
    isoCode: CurrencyIsoCode,
  ): CurrencyAmount {
    const fixedString = fixedNumber.toString();
    if (fixedNumber.isNegative()) {
      throw new Error(`Possible Underflow ${fixedString}}`);
    }

    return {
      unassignedNumber: utils.parseEther(fixedString).toString(),
      decimals,
      isoCode,
    };
  }

  sum(a: CurrencyAmount, b: CurrencyAmount): CurrencyAmount {
    const bigNumberResult = this.toFixedNumber(a).addUnsafe(
      this.toFixedNumber(b),
    );

    return this.toCurrency(
      bigNumberResult,
      bigNumberDecimals,
      a.isoCode || b.isoCode,
    );
  }

  divide(
    dividend: CurrencyAmount,
    divisor: CurrencyAmount,
    outCurrency: CurrencyIsoCode,
  ): CurrencyAmount {
    const division = this.toFixedNumber(dividend).divUnsafe(
      this.toFixedNumber(divisor),
    );

    return this.toCurrency(division, bigNumberDecimals, outCurrency);
  }

  multiply(
    a: CurrencyAmount,
    b: CurrencyAmount,
    outCurrency: CurrencyIsoCode,
  ): CurrencyAmount {
    const res = this.toFixedNumber(a).mulUnsafe(this.toFixedNumber(b));

    return this.toCurrency(res, bigNumberDecimals, outCurrency);
  }

  isNegative(amount: CurrencyAmount): boolean {
    return this.toFixedNumber(amount).isNegative();
  }

  isPositive(amount: CurrencyAmount): boolean {
    return !this.toFixedNumber(amount).isNegative();
  }
}

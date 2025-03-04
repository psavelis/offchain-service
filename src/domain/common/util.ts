export type Nullable<T> = T | undefined;

export const formatDecimals = (
  value: string,
  decimalsLength: number,
  options: { separator?: string; truncateDecimals?: number } = {},
) => {
  const separator = options?.separator ?? '.';

  if (!decimalsLength) {
    return `${value}${separator}${'0'.repeat(options?.truncateDecimals ?? 2)}`;
  }

  if (decimalsLength < 0) {
    throw new Error(
      'formatDecimals: Decimals length must be greater than or equal to zero',
    );
  }

  const valuePadded = value.padStart(decimalsLength, '0');

  const integer = valuePadded.slice(0, -decimalsLength).padStart(1, '0');
  let decimals = valuePadded.slice(-decimalsLength);

  if (options?.truncateDecimals) {
    decimals = decimals.slice(0, options.truncateDecimals);
  }

  return `${integer}${separator}${decimals}`;
};

const commonPrecision = 1_000_000_000;

export const unsafeMul = function (a, b) {
  a *= commonPrecision;
  b *= commonPrecision;

  return (a * b) / (commonPrecision * commonPrecision);
};

export const hideEmailPartially = (emailAddress: string) => {
  return emailAddress.replace(/(.{3})(.*)(?=@)/, (gp1, gp2, gp3) => {
    for (let i = 0; i < gp3.length; i++) {
      gp2 += '****';
    }

    return gp2;
  });
};

export const cryptoWalletRegEx = /^0x[a-fA-F0-9]{40}$/g;
export const onlyDigits = /^\d+$/;
export const onlyCurrencies = /^[A-Z]{3,5}$/;
export const validateDecimals = (n: number) => n >= 0 && n <= 18;

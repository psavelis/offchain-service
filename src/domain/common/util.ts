export const formatDecimals = (
  value: string,
  decimalsLength: number,
  options: { separator?: string; truncateDecimals?: number } = {},
) => {
  const separator = options?.separator ?? '.';

  const valuePadded = value.padStart(decimalsLength, '0');

  const integer = valuePadded.slice(0, -decimalsLength).padStart(1, '0');
  let decimals = valuePadded.slice(-decimalsLength);

  if (options?.truncateDecimals) {
    decimals = decimals.slice(0, options.truncateDecimals);
  }

  return `${integer}${separator}${decimals}`;
};

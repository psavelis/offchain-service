import { formatDecimals } from './util';

describe('Utils', () => {
  describe('formatDecimals', () => {
    it('should return the correct value when no decimals were provided', () => {
      const amount = {
        unassignedNumber: '1000',
        decimals: 0,
        isoCode: 'BRL',
      };

      const result = Number(
        formatDecimals(amount.unassignedNumber, amount.decimals, {
          separator: '.',
        }),
      );

      expect(result).toBe(1000);
    });

    it('should return the correct value when 2 decimals were provided', () => {
      const amount = {
        unassignedNumber: '100000',
        decimals: 2,
        isoCode: 'BRL',
      };

      const result = Number(
        formatDecimals(amount.unassignedNumber, amount.decimals, {
          separator: '.',
        }),
      );

      expect(result).toBe(1000);
    });
  });
});

import { PreSaleEventType } from '../dtos/presale-event.dto';
import { VerifyPreSaleMintUseCase } from './verify-presale-mint.usecase';

describe('VerifyPreSaleMintUseCase', () => {
  it('should return true if the presale mint is valid', async () => {
    const fetchablePresaleEventPort = {
      fetch: jest.fn().mockResolvedValue([
        {
          type: PreSaleEventType.CLAIM,
          amount: 1,
          timestamp: new Date(),
        },
        {
          type: PreSaleEventType.PURCHASE,
          amount: 1,
          timestamp: new Date(),
        },
      ]),
    };
    const fetchableBadgeEventPort = {
      fetch: jest.fn().mockResolvedValue([]),
    };
    const usecase = new VerifyPreSaleMintUseCase(
      fetchablePresaleEventPort,
      fetchableBadgeEventPort,
    );
    const result = await usecase.execute({ cryoptoWallet: '0x0' });
    expect(result.isVerified).toBeTruthy();
    expect(result.amount).toBe(1);
  });

  it('should return false if the presale mint is NOT valid', async () => {
    const fetchablePresaleEventPort = {
      fetch: jest.fn().mockResolvedValue([]),
    };
    const fetchableBadgeEventPort = {
      fetch: jest.fn().mockResolvedValue([]),
    };
    const usecase = new VerifyPreSaleMintUseCase(
      fetchablePresaleEventPort,
      fetchableBadgeEventPort,
    );
    const result = await usecase.execute({ cryoptoWallet: '0x0' });
    expect(result.isVerified).toBeFalsy();
    expect(result.amount).toBe(0);
  });
});

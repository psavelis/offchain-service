import { ethers } from 'ethers';
import { PreSaleEventType } from '../dtos/presale-event.dto';
import { VerifyPreSaleMintUseCase } from './verify-presale-mint.usecase';
import { Chain } from '../../common/entities/chain.entity';
import { NetworkType } from '../../common/enums/network-type.enum';

const settingsMock: any = {
  badge: {
    presale: {
      referenceMetadataId: 2,
    },
  },
};

let randomWallet;

describe('VerifyPreSaleMintUseCase', () => {
  beforeEach(() => {
    randomWallet = ethers.Wallet.createRandom();
  });

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

    const fetchableMintHistoryPort = {
      fetchLast: jest.fn().mockResolvedValue(undefined),
    };

    const usecase = new VerifyPreSaleMintUseCase(
      settingsMock,
      fetchablePresaleEventPort,
      fetchableBadgeEventPort,
      fetchableMintHistoryPort,
    );

    const result = await usecase.execute({
      cryptoWallet: randomWallet.address,
      chain: new Chain(NetworkType.PolygonMumbai),
    });

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

    const fetchableMintHistoryPort = {
      fetchLast: jest.fn().mockResolvedValue(undefined),
    };

    const usecase = new VerifyPreSaleMintUseCase(
      settingsMock,
      fetchablePresaleEventPort,
      fetchableBadgeEventPort,
      fetchableMintHistoryPort,
    );

    const result = await usecase.execute({
      cryptoWallet: randomWallet.address,
      chain: new Chain(NetworkType.PolygonMumbai),
    });

    expect(result.isVerified).toBeFalsy();
    expect(result.amount).toBe(0);
  });
});

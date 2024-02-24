import { Settings } from '../../../common/settings';
import { FetchableBadgeEventPort } from '../../ports/fetchable-badge-event.port';
import { BadgeEventType } from '../../dtos/badge-event.dto';
import { FetchableAuditPoolRemoteEventPort } from '../../ports/impactful-cultivation/fetchable-auditpool-remote-event.port';
import { FetchableAuditPoolStakesPort } from '../../ports/impactful-cultivation/fetchable-auditpool-stakes.port';
import { FetchAuditPoolBadgeEligibilityUseCase } from './fetch-auditpool-badge-eligibility.usecase';
import { ethers } from 'ethers';
import { AuditPoolEventType } from '../../../upstream-domains/impactful-cultivation/enums/audit-pool-event.enum';

describe('FetchAuditPoolBadgeEligibilityUseCase', () => {
  let fetchableAuditPoolEventPort: FetchableAuditPoolRemoteEventPort;
  let fetchableAuditPoolStakesPort: FetchableAuditPoolStakesPort;
  let fetchableBadgeEventPort: FetchableBadgeEventPort;
  const settings = {
    badge: {
      impactfulCultivation: {
        auditPool: {
          referenceMetadataId: 3,
        },
      },
    },
  } as Settings;

  beforeEach(() => {
    jest.resetAllMocks();

    fetchableAuditPoolEventPort = {
      fetch: jest.fn().mockResolvedValue([]),
    };

    fetchableAuditPoolStakesPort = {
      fetchStakeOf: jest.fn().mockResolvedValue(false),
    };

    fetchableBadgeEventPort = {
      fetch: jest.fn().mockResolvedValue([]),
    };
  });

  it('throws error when cryptoWallet is invalid', async () => {
    const cryptoWallet = 'invalid-wallet';

    const fetchAuditPoolBadgeEligibilityUseCase =
      new FetchAuditPoolBadgeEligibilityUseCase(
        settings,
        fetchableAuditPoolEventPort,
        fetchableAuditPoolStakesPort,
        fetchableBadgeEventPort,
      );

    await expect(
      fetchAuditPoolBadgeEligibilityUseCase.execute(cryptoWallet),
    ).rejects.toThrowError('invalid wallet address');
  });

  it('returns undefined when cryptoWallet is not staked', async () => {
    const cryptoWallet = ethers.Wallet.createRandom().address;

    const fetchAuditPoolBadgeEligibilityUseCase =
      new FetchAuditPoolBadgeEligibilityUseCase(
        settings,
        fetchableAuditPoolEventPort,
        fetchableAuditPoolStakesPort,
        fetchableBadgeEventPort,
      );

    const result = await fetchAuditPoolBadgeEligibilityUseCase.execute(
      cryptoWallet,
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when cryptoWallet has already minted', async () => {
    const cryptoWallet = ethers.Wallet.createRandom().address;

    fetchableBadgeEventPort.fetch = jest.fn().mockResolvedValue([
      {
        type: BadgeEventType.MINT,
        referenceMetadataId: 3,
        cryptoWallet,
        timestamp: 0,
      },
    ]);

    const fetchAuditPoolBadgeEligibilityUseCase =
      new FetchAuditPoolBadgeEligibilityUseCase(
        settings,
        fetchableAuditPoolEventPort,
        fetchableAuditPoolStakesPort,
        fetchableBadgeEventPort,
      );

    const result = await fetchAuditPoolBadgeEligibilityUseCase.execute(
      cryptoWallet,
    );

    expect(result).toBeUndefined();
  });

  it('returns undefined when audit pool is not finalized', async () => {
    const cryptoWallet = ethers.Wallet.createRandom().address;

    const fetchAuditPoolBadgeEligibilityUseCase =
      new FetchAuditPoolBadgeEligibilityUseCase(
        settings,
        fetchableAuditPoolEventPort,
        fetchableAuditPoolStakesPort,
        fetchableBadgeEventPort,
      );

    const result = await fetchAuditPoolBadgeEligibilityUseCase.execute(
      cryptoWallet,
    );

    expect(result).toBeUndefined();
  });

  it('returns payload when audit pool is finalized and user has staked but not minted', async () => {
    const cryptoWallet = ethers.Wallet.createRandom().address;

    fetchableAuditPoolEventPort.fetch = jest.fn().mockResolvedValue([
      {
        type: AuditPoolEventType.FINALIZED,
        cryptoWallet,
        timestamp: 0,
      },
    ]);

    fetchableAuditPoolStakesPort.fetchStakeOf = jest
      .fn()
      .mockResolvedValue(true);

    const fetchAuditPoolBadgeEligibilityUseCase =
      new FetchAuditPoolBadgeEligibilityUseCase(
        settings,
        fetchableAuditPoolEventPort,
        fetchableAuditPoolStakesPort,
        fetchableBadgeEventPort,
      );

    const result = await fetchAuditPoolBadgeEligibilityUseCase.execute(
      cryptoWallet,
    );

    expect(result).toMatchInlineSnapshot(`
      {
        "amount": 1,
        "referenceMetadataId": 3,
      }
    `);
  });

  it('returns undefined when audit pool is finalized and user has staked & minted', async () => {
    const cryptoWallet = ethers.Wallet.createRandom().address;

    fetchableAuditPoolEventPort.fetch = jest.fn().mockResolvedValue([
      {
        type: AuditPoolEventType.FINALIZED,
        cryptoWallet,
        timestamp: 0,
      },
    ]);

    fetchableAuditPoolStakesPort.fetchStakeOf = jest
      .fn()
      .mockResolvedValue(true);

    fetchableBadgeEventPort.fetch = jest.fn().mockResolvedValue([
      {
        type: BadgeEventType.MINT,
        referenceMetadataId: 3,
        cryptoWallet,
        timestamp: 0,
      },
    ]);

    const fetchAuditPoolBadgeEligibilityUseCase =
      new FetchAuditPoolBadgeEligibilityUseCase(
        settings,
        fetchableAuditPoolEventPort,
        fetchableAuditPoolStakesPort,
        fetchableBadgeEventPort,
      );

    const result = await fetchAuditPoolBadgeEligibilityUseCase.execute(
      cryptoWallet,
    );

    expect(result).toBeUndefined();
  });
});

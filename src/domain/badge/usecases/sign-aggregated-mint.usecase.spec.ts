import { ethers } from 'ethers';
import { SignMintInteractor } from '../interactors/sign-mint.interactor';
import { VerifyMintInteractor } from '../interactors/verify-mint-request.interactor';
import { FetchAggregatedSignatureUseCase } from './fetch-aggregated-signature.usecase';

describe('FetchAggregatedSignatureUseCase', () => {
  let signAggregatedMintInteractor: SignMintInteractor;
  let verifyAggregatedMintInteractor: VerifyMintInteractor;

  const settingsMock = {
    badge: {
      impactfulCultivation: {
        auditPool: {
          referenceMetadataId: 4,
        },
        auditPoolEarlyValidator: {
          referenceMetadataId: 3,
        },
      },
      presale: {
        referenceMetadataId: 2,
      },
    },
  } as any;

  beforeEach(() => {
    jest.resetAllMocks();

    signAggregatedMintInteractor = {
      execute: jest.fn(),
    };

    verifyAggregatedMintInteractor = {
      execute: jest.fn(),
    };
  });

  it('should return undefined if the aggregated badge mint is NOT valid', async () => {
    const fetchAggregatedSignatureUseCase = new FetchAggregatedSignatureUseCase(
      signAggregatedMintInteractor,
      verifyAggregatedMintInteractor,
    );

    const result = await fetchAggregatedSignatureUseCase.execute(
      ethers.Wallet.createRandom().address,
      settingsMock.badge.impactfulCultivation.auditPool.referenceMetadataId,
      '',
      '',
    );

    expect(result).toBeUndefined();
  });

  it('should return the signature if the aggregated badge mint is valid', async () => {
    const fetchAggregatedSignatureUseCase = new FetchAggregatedSignatureUseCase(
      signAggregatedMintInteractor,
      verifyAggregatedMintInteractor,
    );

    const result = await fetchAggregatedSignatureUseCase.execute(
      ethers.Wallet.createRandom().address,
      settingsMock.badge.impactfulCultivation.auditPool.referenceMetadataId,
      '',
      '',
    );

    expect(result).toBeUndefined();
  });
});

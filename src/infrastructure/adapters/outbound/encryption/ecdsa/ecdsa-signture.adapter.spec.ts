import { ethers } from 'ethers';
import { ECDSASignatureAdapter } from './ecdsa-signature.adapter';
import { Chain } from '../../../../../domain/common/entities/chain.entity';
import { NetworkType } from '../../../../../domain/common/enums/network-type.enum';
import { SignerType } from '../../../../../domain/common/enums/signer-type.enum';

const settingsMock = {
  blockchain: {
    ethereum: {
      legacyClaimSignerKey: ethers.Wallet.createRandom().privateKey,
      currentClaimSignerKey: ethers.Wallet.createRandom().privateKey,
      badgesMinterSignerKey: ethers.Wallet.createRandom().privateKey,
    },
    polygon: {
      claimSignerKey: ethers.Wallet.createRandom().privateKey,
    },
  },
};

describe('ECDSASignatureAdapter', () => {
  it('should return a signature on L1 (Ethereum) for a given payload', async () => {
    const signatureAdapter = ECDSASignatureAdapter.getInstance(
      settingsMock as any,
    );

    const result = await signatureAdapter.sign(
      {
        types: ['address', 'uint256', 'uint256'],
        values: [ethers.Wallet.createRandom().address, '1', '1'],
      },
      SignerType.SaleClaimManager,
      new Chain(NetworkType.EthereumGoerli),
    );

    expect(result).toHaveProperty('signature');
    expect(result).toHaveProperty('nonce');
    expect(result).toHaveProperty('cryptoWallet');
  });

  it('should return a signature on L2 (Polygon) for a given payload', async () => {
    const signatureAdapter = ECDSASignatureAdapter.getInstance(
      settingsMock as any,
    );

    const result = await signatureAdapter.sign(
      {
        types: ['address', 'uint256', 'uint256'],
        values: [ethers.Wallet.createRandom().address, '1', '1'],
      },
      SignerType.SaleClaimManager,
      new Chain(NetworkType.PolygonMumbai),
    );

    expect(result).toHaveProperty('signature');
    expect(result).toHaveProperty('nonce');
    expect(result).toHaveProperty('cryptoWallet');
  });
});

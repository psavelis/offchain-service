import { ethers } from 'ethers';
import { ECDSASignatureAdapter } from './ecdsa-signature.adapter';

const settingsMock = {
  blockchain: {
    legacyClaimSignerKey: ethers.Wallet.createRandom().privateKey,
    currentClaimSignerKey: ethers.Wallet.createRandom().privateKey,
    badgesMinterSignerKey: ethers.Wallet.createRandom().privateKey,
  },
};

describe('ECDSASignatureAdapter', () => {
  it('should return a signature for a given payload', async () => {
    const signatureAdapter = ECDSASignatureAdapter.getInstance(
      settingsMock as any,
    );

    const result = await signatureAdapter.sign(
      {
        types: ['address', 'uint256', 'uint256'],
        values: [ethers.Wallet.createRandom().address, '1', '1'],
      },
      0,
    );

    expect(result).toHaveProperty('signature');
    expect(result).toHaveProperty('nonce');
    expect(result).toHaveProperty('cryptoWallet');
  });
});

import {type Role} from '../entities/role.entity';
import {type RoleType} from '../enums/role-type.enum';

export type FetchableRolePort = {
	fetchByFingerprint(fingerprint: string): Promise<Role | undefined>;
	fetchLastBlocks(): Promise<{
		ethereumLastBlock: number;
		polygonLastBlock: number;
	}>;

	findByClientIdAndChainId(
		encryptedIdentifier: string,
		chainId: number,
		requestedScopes: RoleType[],
	): Promise<Role[]>;
};

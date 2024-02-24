import {type Role} from '../entities/role.entity';

export type PersistableRolePort = {
	create(role: Role): Promise<Role>;
};

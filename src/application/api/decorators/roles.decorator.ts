import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../../../domain/upstream-domains/identity/authentication/enums/role-type.enum';

export const Roles = (and?: RoleType[], or?: RoleType[], xor?: RoleType[]) => {
  return SetMetadata('roles', { and, or, xor });
};

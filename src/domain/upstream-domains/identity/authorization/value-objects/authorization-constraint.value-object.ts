import { RoleType } from '../../authentication/enums/role-type.enum';

export interface AuthRoleConstraint<T extends RoleType> {
  EQ?: T[];
  OR?: T[];
  XOR?: T[];
}

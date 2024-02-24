import {
  RoleType,
  type ResourceCategoryScopes,
} from '../../upstream-domains/identity/authentication/enums/role-type.enum';

export type TokenPayload = {
  [key: string]:
    | string
    | number
    | object[]
    | Partial<ResourceCategoryScopes>
    | RoleType[];
  sub?: string;
  aud?: string;
  iss?: string;
  iat?: number;
  exp?: number;
  nbf?: number;
  chainId?: string;
  roles?: RoleType[];
  scopes?: Partial<ResourceCategoryScopes>;
};

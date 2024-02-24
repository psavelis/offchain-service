import { Role, type RoleProps } from '../entities/role.entity';

export class RoleBuilder {
  private readonly role: Partial<RoleProps>;

  constructor(partial?: Partial<RoleProps>) {
    this.role = partial ?? {};
  }

  withFingerprint(fingerprint: string): this {
    this.role.fingerprint = fingerprint;
    return this;
  }

  withExpiresAt(expiresAt: Date): this {
    this.role.expiresAt = expiresAt;
    return this;
  }

  withTransactionHash(transactionHash: string): this {
    this.role.transactionHash = transactionHash;
    return this;
  }

  withRoleType(role: RoleProps['roleType']): this {
    this.role.roleType = role;
    return this;
  }

  withUserIdentifier(userIdentifier: RoleProps['userIdentifier']): this {
    this.role.userIdentifier = userIdentifier;
    return this;
  }

  build(): Role {
    return new Role(this.role as RoleProps);
  }
}

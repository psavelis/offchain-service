import {Entity, type Props} from '../../../../common/entity';
import {type GrantType} from '../enums/grant-type.enum';
import {type ResourceCategoryScopes, type RoleType} from '../enums/role-type.enum';

export type AccessTokenProps = {
	challengeId: string;
	userIdentifier: string;
	grantType: GrantType;
	chainId: number;
	roles: RoleType[];
	scopes: Partial<ResourceCategoryScopes>;
	dueDate: Date;
	clientIp: string;
	clientAgent: string;
} & Props;

export class AccessToken extends Entity<AccessTokenProps> {
  constructor(props: AccessTokenProps, id?: string) {
    super(props, id);
  }

  getUserIdentifier(): string {
    return this.props.userIdentifier;
  }

  getChallengeId(): string {
    return this.props.challengeId;
  }

  getGrantType(): GrantType {
    return this.props.grantType;
  }

  getChainId(): number {
    return this.props.chainId;
  }

  getRoles(): RoleType[] {
    return this.props.roles;
  }

  getScopes(): Partial<ResourceCategoryScopes> {
    return this.props.scopes;
  }

  getDueDate(): Date {
    return this.props.dueDate;
  }

  getClientIp(): string {
    return this.props.clientIp;
  }

  getClientAgent(): string {
    return this.props.clientAgent;
  }
}

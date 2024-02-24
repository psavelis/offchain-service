import {Entity, type Props} from '../../../../common/entity';
import {type GrantType} from '../enums/grant-type.enum';
import {NetworkType} from '../../../../common/enums/network-type.enum';
import {type Chain} from '../../../../common/entities/chain.entity';
import {type AuthChallengeSignatureData} from '../dtos/auth-challenge-signature-data.dto';
import {DAPP_DOMAIN} from '../../../../common/constants/domains.contants';
import {RoleType} from '../enums/role-type.enum';
import {
  AUDIENCE_TIMEZONE,
  getCurrentISOStringDate,
} from '../../../../common/date-util';
import {LayerType} from '../../../../common/enums/layer-type.enum';

export type AuthChallengeProps = {
	userIdentifier: string;
	grantType: GrantType;
	chainId: NetworkType;
	payload: AuthChallengeSignatureData;
	uri: string;
	nonce: string;
	scope: string;
	dueDate: Date;
	clientIp: string;
	clientAgent: string;
} & Props;

export class AuthChallenge extends Entity<AuthChallengeProps> {
  getNonce() {
    return this.props.nonce;
  }

  getUri() {
    return this.props.uri;
  }

  getUserIdentifier(): string {
    return this.props.userIdentifier;
  }

  constructor(props: AuthChallengeProps, id?: string) {
    super(props, id);
  }

  static getSignatureData(
    cryptoWalletAddressOrClientId: string,
    nonce: string,
    chain: Chain,
    uri: string,
  ): AuthChallengeSignatureData {
    const signatureData: AuthChallengeSignatureData = {
      domain: DAPP_DOMAIN,
      address: cryptoWalletAddressOrClientId,
      statement: `Sign-in with ${NetworkType[chain.chainId]}${
        chain.layer === LayerType.L2 ? ' (Layer 2)' : ''
      } to ${DAPP_DOMAIN} with ${cryptoWalletAddressOrClientId} at nonce #${nonce}.\nProtocol: EIP-4361\nScope: Identity Verification`,
      uri,
      version: '1',
      chainId: chain.id,
      nonce,
      issuedAt: getCurrentISOStringDate(AUDIENCE_TIMEZONE),
    };

    return signatureData;
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

  getChainId(): NetworkType {
    return this.props.chainId;
  }

  getPayload(): AuthChallengeSignatureData {
    return this.props.payload;
  }

  getScope(): string {
    return this.props.scope;
  }

  getRawScopes(): string[] {
    return this.props.scope?.split(',');
  }

  getRoles(): RoleType[] {
    return this.props.scope
      ?.split(',')
      .filter((role) => Object.keys(RoleType).includes(role))
      .map((role) => RoleType[role]);
  }

  getGrantType(): GrantType {
    return this.props.grantType;
  }
}

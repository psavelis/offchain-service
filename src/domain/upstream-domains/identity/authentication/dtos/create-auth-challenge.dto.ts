import { ApiProperty } from '@nestjs/swagger';
import { GrantType } from '../enums/grant-type.enum';

export class CreateAuthChallengeDto {
  @ApiProperty({
    description: 'URI',
    example: 'https://dapp.kannacoin.io/auth/callback',
    required: true,
  })
  uri: string;

  @ApiProperty({
    description: 'Client ID',
    example: '0x1234567890',
    required: true,
  })
  clientId: string;

  @ApiProperty({
    description: 'Chain ID',
    example: 137,
    required: true,
  })
  chainId: number;

  @ApiProperty({
    description: 'Grant Type',
    example: GrantType.AUTHORIZATION_CODE,
    required: true,
  })
  grantType: GrantType;

  @ApiProperty({
    description: 'Scope',
    example: '0x1a4',
    required: true,
  })
  scope: string;

  clientIp: string;
  clientAgent: string;
}

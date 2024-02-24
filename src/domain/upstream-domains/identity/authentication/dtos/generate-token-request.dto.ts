import { ApiProperty } from '@nestjs/swagger';

export class GenerateTokenRequestDto {
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
    description: 'Challenge ID',
    example: '1e4e3e2e1e0e',
    required: true,
  })
  challengeId: string;

  @ApiProperty({
    description: 'Signature',
    example: 'ef3e2e1e0e',
    required: true,
  })
  signature: string;

  clientIp: string;
  clientAgent: string;
}

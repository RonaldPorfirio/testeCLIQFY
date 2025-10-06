import { ApiProperty } from '@nestjs/swagger';

import { AuthUserDto } from './auth-user.dto';

export class LoginResponseDto {
  @ApiProperty({
    description: 'Token JWT de acesso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token!: string;

  @ApiProperty({
    description: 'Token JWT de refresh',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh...',
  })
  refreshToken!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}

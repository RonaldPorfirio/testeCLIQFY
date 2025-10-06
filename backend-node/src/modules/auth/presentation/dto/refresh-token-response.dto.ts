import { ApiProperty } from '@nestjs/swagger';

import { AuthUserDto } from './auth-user.dto';

export class RefreshTokenResponseDto {
  @ApiProperty({
    description: 'Novo token JWT de acesso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  token!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}

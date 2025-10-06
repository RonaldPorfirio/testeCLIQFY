import { ApiProperty } from '@nestjs/swagger';

import { AuthUserDto } from './auth-user.dto';

export class ProfileResponseDto {
  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}

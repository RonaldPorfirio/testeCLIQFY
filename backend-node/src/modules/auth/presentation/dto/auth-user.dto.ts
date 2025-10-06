import { ApiProperty } from '@nestjs/swagger';

import { UserRole } from '@modules/auth/domain/entities/user.entity';

export class AuthUserDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'admin' })
  username!: string;

  @ApiProperty({ example: 'admin@example.com' })
  email!: string;

  @ApiProperty({ example: 'Administrador' })
  name!: string;

  @ApiProperty({ enum: ['admin', 'agent', 'viewer'], example: 'admin' })
  role!: UserRole;
}

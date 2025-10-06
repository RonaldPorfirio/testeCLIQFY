import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoginRequestDto {
  @ApiPropertyOptional({
    description: 'Login ou username cadastrado',
    example: 'admin',
  })
  login?: string;

  @ApiPropertyOptional({
    description: 'Email do usuário',
    example: 'admin@example.com',
  })
  email?: string;

  @ApiProperty({
    description: 'Senha de acesso',
    example: 'admin123',
  })
  password!: string;
}

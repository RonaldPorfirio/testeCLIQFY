import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckinDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 3 })
  workorderId!: number;

  @ApiPropertyOptional({ example: 5, nullable: true })
  userId?: number | null;

  @ApiProperty({ example: 'Check-in realizado via aplicativo móvel' })
  note!: string;

  @ApiProperty({ example: '2025-01-20T14:05:00.000Z' })
  createdAt!: string;

  @ApiPropertyOptional({ example: -23.5489, nullable: true })
  latitude?: number | null;

  @ApiPropertyOptional({ example: -46.6388, nullable: true })
  longitude?: number | null;

  @ApiPropertyOptional({
    description: 'Foto em base64 associada ao check-in',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
    nullable: true,
  })
  photo?: string | null;
}

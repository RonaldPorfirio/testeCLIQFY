import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCheckinDto {
  @ApiProperty({
    description: 'Observação ou nota relacionada ao check-in',
    example: 'Equipe presente no local às 14h',
  })
  note!: string;

  @ApiPropertyOptional({
    description: 'Latitude coletada pelo GPS',
    example: -23.5489,
    nullable: true,
  })
  latitude?: number | null;

  @ApiPropertyOptional({
    description: 'Longitude coletada pelo GPS',
    example: -46.6388,
    nullable: true,
  })
  longitude?: number | null;

  @ApiPropertyOptional({
    description: 'Foto em base64 capturada no check-in',
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...',
    nullable: true,
  })
  photo?: string | null;
}

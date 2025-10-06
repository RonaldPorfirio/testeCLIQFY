import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { WorkorderPriority, WorkorderStatus } from '@modules/workorders/domain/entities/workorder.entity';

export class CreateWorkorderDto {
  @ApiProperty({ example: 'Instalação de câmeras de segurança' })
  title!: string;

  @ApiProperty({ example: 'Instalação de quatro câmeras na recepção e área externa.' })
  description!: string;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'urgent'], example: 'high' })
  priority!: WorkorderPriority;

  @ApiProperty({ example: 'Empresa XPTO LTDA' })
  clientName!: string;

  @ApiProperty({ example: 'contato@empresa.com' })
  clientEmail!: string;

  @ApiPropertyOptional({ example: 'Maria Lima' })
  assignedTo?: string;

  @ApiPropertyOptional({ enum: ['pending', 'in_progress', 'completed', 'cancelled'], example: 'pending' })
  status?: WorkorderStatus;
}

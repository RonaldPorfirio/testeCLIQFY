import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { WorkorderPriority, WorkorderStatus } from '@modules/workorders/domain/entities/workorder.entity';

export class WorkorderDto {
  @ApiProperty({ example: '1' })
  id!: string;

  @ApiProperty({ example: 'Instalação de Sistema de Ar Condicionado' })
  title!: string;

  @ApiProperty({
    example: 'Instalação completa de sistema split em escritório comercial',
  })
  description!: string;

  @ApiProperty({ enum: ['pending', 'in_progress', 'completed', 'cancelled'], example: 'pending' })
  status!: WorkorderStatus;

  @ApiProperty({ enum: ['low', 'medium', 'high', 'urgent'], example: 'medium' })
  priority!: WorkorderPriority;

  @ApiProperty({ example: 'Empresa ABC Ltda' })
  clientName!: string;

  @ApiProperty({ example: 'contato@empresaabc.com' })
  clientEmail!: string;

  @ApiPropertyOptional({ example: 'João Silva', nullable: true })
  assignedTo?: string | null;

  @ApiProperty({ example: '2025-01-15T10:00:00.000Z' })
  createdAt!: string;

  @ApiProperty({ example: '2025-01-16T14:30:00.000Z' })
  updatedAt!: string;

  @ApiPropertyOptional({ example: '2025-01-17T09:20:00.000Z', nullable: true })
  completedAt?: string | null;
}

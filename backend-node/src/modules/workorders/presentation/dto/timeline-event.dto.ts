import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { TimelineEventType } from '@modules/workorders/domain/entities/timeline-event.entity';

export class TimelineEventDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ enum: ['created', 'status_change', 'assigned', 'comment'], example: 'created' })
  type!: TimelineEventType;

  @ApiProperty({ example: 'Ordem de serviço criada' })
  description!: string;

  @ApiPropertyOptional({ example: 'João Silva', nullable: true })
  userName?: string | null;

  @ApiProperty({ example: '2025-01-16T10:30:00.000Z' })
  timestamp!: string;

  @ApiPropertyOptional({ type: 'object', nullable: true })
  metadata?: Record<string, any> | null;
}

import { ApiProperty } from '@nestjs/swagger';

import { WorkorderDto } from './workorder.dto';

export class WorkorderListDto {
  @ApiProperty({ type: [WorkorderDto] })
  orders!: WorkorderDto[];

  @ApiProperty({ example: 3 })
  total!: number;
}

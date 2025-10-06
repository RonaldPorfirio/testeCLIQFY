import { Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { WorkordersService } from '@modules/workorders/application/services/workorders.service';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/presentation/guards/roles.guard';
import { Roles } from '@modules/auth/presentation/decorators/roles.decorator';
import { TimelineEventDto } from '@modules/workorders/presentation/dto/timeline-event.dto';

@ApiTags('Timeline')
@Controller('timeline')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TimelineController {
  constructor(private readonly workordersService: WorkordersService) {}

  @Get(':orderId')
  @Roles('admin', 'agent', 'viewer')
  @ApiOperation({ summary: 'Retorna os eventos da linha do tempo de uma ordem' })
  @ApiOkResponse({ type: [TimelineEventDto] })
  getTimeline(@Param('orderId') orderId: string, @Request() req: any) {
    return this.workordersService.getTimeline(Number(orderId), req.user);
  }
}

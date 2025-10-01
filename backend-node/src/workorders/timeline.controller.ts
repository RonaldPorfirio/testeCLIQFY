import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { WorkordersService } from './workorders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('timeline')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimelineController {
    constructor(private readonly workordersService: WorkordersService) { }

    @Get(':orderId')
    @Roles('admin', 'agent', 'viewer')
    getTimeline(@Param('orderId') orderId: string, @Request() req: any) {
        return this.workordersService.getTimeline(Number(orderId), req.user);
    }
}

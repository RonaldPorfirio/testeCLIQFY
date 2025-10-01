import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get()
    @Roles('admin', 'agent', 'viewer')
    async getAggregated() {
        return this.reportsService.getAggregatedReport();
    }

    @Get('daily')
    @Roles('admin', 'agent', 'viewer')
    async getDaily() {
        return this.reportsService.getDailyReport();
    }
}

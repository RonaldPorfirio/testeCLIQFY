import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { ReportsService } from '../../application/services/reports.service';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';
import { RolesGuard } from '@modules/auth/presentation/guards/roles.guard';
import { Roles } from '@modules/auth/presentation/decorators/roles.decorator';

@ApiTags('Reports')
@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @Roles('admin', 'agent', 'viewer')
  @ApiOperation({ summary: 'Retorna o relatório agregado de ordens' })
  @ApiOkResponse({
    description: 'Dados consolidados de ordens',
    schema: {
      example: {
        totalOrders: 120,
        completedOrders: 45,
        pendingOrders: 60,
        inProgressOrders: 15,
        averageCompletionTime: 0,
        ordersByStatus: [
          { status: 'completed', count: 45 },
          { status: 'in_progress', count: 15 },
          { status: 'pending', count: 60 },
        ],
        ordersByPriority: [
          { priority: 'urgent', count: 5 },
          { priority: 'high', count: 30 },
          { priority: 'medium', count: 55 },
          { priority: 'low', count: 30 },
        ],
      },
    },
  })
  async getAggregated() {
    return this.reportsService.getAggregatedReport();
  }

  @Get('daily')
  @Roles('admin', 'agent', 'viewer')
  @ApiOperation({ summary: 'Replica o relatório diário bruto do serviço .NET' })
  @ApiOkResponse({ description: 'Resposta proxied do serviço externo', schema: { example: { totalWorkorders: 120 } } })
  async getDaily() {
    return this.reportsService.getDailyReport();
  }
}

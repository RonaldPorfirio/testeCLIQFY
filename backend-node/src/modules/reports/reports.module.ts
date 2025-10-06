import { Module } from '@nestjs/common'
import { HttpModule } from '@nestjs/axios'
import { ReportsService } from '@modules/reports/application/services/reports.service'
import { ReportsController } from '@modules/reports/presentation/controllers/reports.controller'
import { RolesGuard } from '@modules/auth/presentation/guards/roles.guard'

@Module({
  imports: [HttpModule],
  providers: [ReportsService, RolesGuard],
  controllers: [ReportsController],
})
export class ReportsModule {}

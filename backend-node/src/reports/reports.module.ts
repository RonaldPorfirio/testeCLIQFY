import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { RolesGuard } from '../auth/roles.guard';

@Module({
    imports: [HttpModule],
    providers: [ReportsService, RolesGuard],
    controllers: [ReportsController],
})
export class ReportsModule { }

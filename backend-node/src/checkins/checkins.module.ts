import { Module } from '@nestjs/common';
import { CheckinsService } from './checkins.service';
import { CheckinsController } from './checkins.controller';
import { WorkordersModule } from '../workorders/workorders.module';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  imports: [WorkordersModule],
  providers: [CheckinsService, RolesGuard],
  controllers: [CheckinsController]
})
export class CheckinsModule {}

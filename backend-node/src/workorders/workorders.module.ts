import { Module } from '@nestjs/common';
import { WorkordersService } from './workorders.service';
import { WorkordersController } from './workorders.controller';
import { TimelineController } from './timeline.controller';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  providers: [WorkordersService, RolesGuard],
  controllers: [WorkordersController, TimelineController],
  exports: [WorkordersService],
})
export class WorkordersModule { }

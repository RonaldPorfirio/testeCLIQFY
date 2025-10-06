import { Module } from '@nestjs/common';
import { WorkordersService } from '@modules/workorders/application/services/workorders.service';
import { WorkordersController } from '@modules/workorders/presentation/controllers/workorders.controller';
import { TimelineController } from '@modules/workorders/presentation/controllers/timeline.controller';
import { RolesGuard } from '@modules/auth/presentation/guards/roles.guard';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WorkordersService, RolesGuard],
  controllers: [WorkordersController, TimelineController],
  exports: [WorkordersService],
})
export class WorkordersModule {}

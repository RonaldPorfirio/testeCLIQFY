import { Module } from '@nestjs/common';
import { CheckinsService } from '@modules/checkins/application/services/checkins.service';
import { CheckinsController } from '@modules/checkins/presentation/controllers/checkins.controller';
import { WorkordersModule } from '@modules/workorders/workorders.module';
import { RolesGuard } from '@modules/auth/presentation/guards/roles.guard';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, WorkordersModule],
  providers: [CheckinsService, RolesGuard],
  controllers: [CheckinsController],
})
export class CheckinsModule {}

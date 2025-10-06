import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { WorkordersModule } from './modules/workorders/workorders.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AuthModule } from './modules/auth/auth.module';
import { CheckinsModule } from './modules/checkins/checkins.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        transport: { target: 'pino-pretty' },
      },
    }),
    PrismaModule,
    WorkordersModule,
    ReportsModule,
    AuthModule,
    CheckinsModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { WorkordersModule } from './workorders/workorders.module';
import { ReportsModule } from './reports/reports.module';
import { AuthModule } from './auth/auth.module';
import { CheckinsModule } from './checkins/checkins.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        level: 'info',
        transport: { target: 'pino-pretty' },
      },
    }),
    WorkordersModule,
    ReportsModule,
    AuthModule,
    CheckinsModule,
  ],
})
export class AppModule { }

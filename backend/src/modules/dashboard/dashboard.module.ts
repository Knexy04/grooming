import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DashboardController, PublicDistributorDashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [AuthModule],
  controllers: [DashboardController, PublicDistributorDashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}



import { Module } from '@nestjs/common';
import { AuthModule } from './modules/auth/auth.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { LeafletsModule } from './modules/leaflets/leaflets.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, CampaignsModule, LeafletsModule, DashboardModule],
})
export class AppModule {}

import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { DashboardService } from './dashboard.service';

@UseGuards(JwtGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('summary')
  async summary() {
    return await this.dashboard.summary();
  }

  @Get('campaigns')
  async campaigns() {
    return await this.dashboard.campaignsTable();
  }

  @Get('batches')
  async batches(@Query('campaignId') campaignId?: string) {
    return await this.dashboard.batchesTable(campaignId);
  }

  @Get('distributors')
  async distributors() {
    return await this.dashboard.distributorsTable();
  }

  @Get('activations')
  async activations(@Query('take') take?: string) {
    const n = Number(take ?? '100');
    return await this.dashboard.recentActivations(Number.isFinite(n) ? n : 100);
  }
}

// Публичные дашборды для раздатчиков (без авторизации по JWT)
@Controller('public-dashboard')
export class PublicDistributorDashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('overview')
  async overview(@Query('distributorId') distributorId?: string) {
    if (!distributorId) return null;
    return await this.dashboard.distributorOverview(distributorId);
  }

  @Get('batches')
  async batches(@Query('distributorId') distributorId?: string) {
    if (!distributorId) return [];
    return await this.dashboard.distributorBatches(distributorId);
  }
}



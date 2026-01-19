import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard';
import { CampaignsService } from './campaigns.service';

@UseGuards(JwtGuard)
@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaigns: CampaignsService) {}

  @Get()
  async list() {
    return await this.campaigns.list();
  }

  @Post()
  async create(@Body() body: { name?: string; note?: string }) {
    return await this.campaigns.create({
      name: body.name ?? '',
      note: body.note,
    });
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return await this.campaigns.get(id);
  }

  @Post(':id/leaflets')
  async createLeaflet(
    @Param('id') campaignId: string,
    @Body() body: { note?: string; printCount?: number },
  ) {
    return await this.campaigns.createLeaflet(campaignId, {
      note: body.note,
      printCount: body.printCount,
    });
  }
}



import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  private generatePublicCode() {
    // 8 символов base36, достаточно для MVP; можно увеличить при желании
    return randomBytes(6).toString('base64url').slice(0, 8);
  }

  async list() {
    const campaigns = await this.prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return campaigns;
  }

  async create(input: { name: string; note?: string }) {
    const name = input.name.trim();
    if (!name) throw new BadRequestException('name is required');

    return await this.prisma.campaign.create({
      data: { name, note: input.note?.trim() || null },
    });
  }

  async get(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        leaflets: {
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { activations: true } },
            assignments: {
              where: { unassignedAt: null },
              orderBy: { assignedAt: 'desc' },
              take: 1,
              include: { distributor: true },
            },
          },
        },
      },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');
    return campaign;
  }

  async createLeaflet(
    campaignId: string,
    input: { note?: string; printCount?: number },
  ) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
    });
    if (!campaign) throw new NotFoundException('Campaign not found');

    const printCount = Math.max(1, Math.min(50000, input.printCount ?? 1));
    const note = input.note?.trim() || null;

    // Одна запись = одна пачка. Внутри пачки все бумажки одинаковые (один publicCode/QR).
    let lastErr: unknown = null;
    for (let attempt = 0; attempt < 10; attempt++) {
      const publicCode = this.generatePublicCode();
      try {
        return await this.prisma.leaflet.create({
          data: { campaignId, publicCode, note, printCount },
        });
      } catch (e) {
        lastErr = e;
      }
    }
    throw lastErr;
  }
}



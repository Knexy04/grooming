import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [campaigns, batches, activations] = await Promise.all([
      this.prisma.campaign.count(),
      this.prisma.leaflet.count(),
      this.prisma.activation.count(),
    ]);

    const activationsWithReward = await this.prisma.activation.findMany({
      select: {
        id: true,
        assignment: { select: { rewardPerClient: true } },
      },
    });

    const totalPayout = activationsWithReward.reduce((sum, a) => {
      const reward = a.assignment?.rewardPerClient ?? 0;
      return sum + reward;
    }, 0);

    return { campaigns, batches, activations, totalPayout };
  }

  async campaignsTable() {
    const campaigns = await this.prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { leaflets: true } },
        leaflets: {
          select: { id: true, _count: { select: { activations: true } } },
        },
      },
    });

    return campaigns.map((c) => {
      const activations = c.leaflets.reduce((sum, l) => sum + (l._count.activations ?? 0), 0);
      return {
        id: c.id,
        name: c.name,
        status: c.status,
        note: c.note,
        createdAt: c.createdAt,
        batches: c._count.leaflets,
        activations,
      };
    });
  }

  async batchesTable(campaignId?: string) {
    const where = campaignId ? { campaignId } : undefined;
    const batches = await this.prisma.leaflet.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        campaign: true,
        _count: { select: { activations: true } },
        assignments: {
          where: { unassignedAt: null },
          orderBy: { assignedAt: 'desc' },
          take: 1,
          include: { distributor: true },
        },
      },
    });

    return batches.map((b) => ({
      id: b.id,
      publicCode: b.publicCode,
      printCount: b.printCount,
      status: b.status,
      note: b.note,
      createdAt: b.createdAt,
      activations: b._count.activations,
      campaign: { id: b.campaign.id, name: b.campaign.name },
      currentDistributor: b.assignments[0]?.distributor
        ? {
            id: b.assignments[0].distributor.id,
            fullName: b.assignments[0].distributor.fullName,
            phone: b.assignments[0].distributor.phone,
            rewardPerClient: b.assignments[0].rewardPerClient,
          }
        : null,
    }));
  }

  async distributorsTable() {
    const distributors = await this.prisma.distributor.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        assignments: {
          include: {
            leaflet: { include: { campaign: true } },
            activations: true,
          },
        },
      },
    });

    return distributors.map((d) => {
      let activations = 0;
      let payout = 0;
      let activeBatches = 0;

      for (const a of d.assignments) {
        activations += a.activations.length;
        payout += a.activations.length * a.rewardPerClient;
        if (!a.unassignedAt) activeBatches += 1;
      }

      return {
        id: d.id,
        fullName: d.fullName,
        phone: d.phone,
        note: d.note,
        createdAt: d.createdAt,
        activeBatches,
        activations,
        payout,
      };
    });
  }

  async recentActivations(take = 100) {
    const items = await this.prisma.activation.findMany({
      take: Math.max(1, Math.min(500, take)),
      orderBy: { activatedAt: 'desc' },
      include: {
        leaflet: { include: { campaign: true } },
        assignment: { include: { distributor: true } },
        activatedBy: { select: { email: true, id: true } },
      },
    });

    return items.map((a) => ({
      id: a.id,
      activatedAt: a.activatedAt,
      note: a.note,
      campaign: { id: a.leaflet.campaign.id, name: a.leaflet.campaign.name },
      batch: { id: a.leaflet.id, publicCode: a.leaflet.publicCode },
      distributor: a.assignment?.distributor
        ? {
            id: a.assignment.distributor.id,
            fullName: a.assignment.distributor.fullName,
            phone: a.assignment.distributor.phone,
          }
        : null,
      rewardPerClient: a.assignment?.rewardPerClient ?? 0,
      activatedBy: a.activatedBy,
    }));
  }
}



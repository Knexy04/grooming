import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class LeafletsService {
  constructor(private readonly prisma: PrismaService) {}

  async byCode(publicCode: string) {
    const code = publicCode.trim();
    const leaflet = await this.prisma.leaflet.findUnique({
      where: { publicCode: code },
      include: { campaign: true },
    });
    if (!leaflet) throw new NotFoundException('Leaflet not found');

    const currentAssignment = await this.prisma.leafletAssignment.findFirst({
      where: { leafletId: leaflet.id, unassignedAt: null },
      orderBy: { assignedAt: 'desc' },
      include: { distributor: true },
    });

    return {
      leaflet: {
        id: leaflet.id,
        publicCode: leaflet.publicCode,
        printCount: leaflet.printCount,
        status: leaflet.status,
        note: leaflet.note,
        createdAt: leaflet.createdAt,
      },
      campaign: {
        id: leaflet.campaign.id,
        name: leaflet.campaign.name,
        status: leaflet.campaign.status,
        note: leaflet.campaign.note,
      },
      currentAssignment: currentAssignment
        ? {
            id: currentAssignment.id,
            assignedAt: currentAssignment.assignedAt,
            rewardPerClient: currentAssignment.rewardPerClient,
            note: currentAssignment.note,
            distributor: {
              id: currentAssignment.distributor.id,
              fullName: currentAssignment.distributor.fullName,
              phone: currentAssignment.distributor.phone,
            },
          }
        : null,
    };
  }

  private normalizePhone(phone: string) {
    return phone.replace(/[^\d+]/g, '').trim();
  }

  async assignByCode(
    publicCode: string,
    input: { fullName: string; phone: string; rewardPerClient: number; note?: string },
  ) {
    const { leaflet, currentAssignment } = await this.byCode(publicCode);
    if (currentAssignment) {
      throw new ConflictException('Leaflet already assigned');
    }
    return await this.createAssignment(leaflet.id, input);
  }

  async reassignByCode(
    publicCode: string,
    input: { fullName: string; phone: string; rewardPerClient: number; note?: string },
  ) {
    const { leaflet, currentAssignment } = await this.byCode(publicCode);

    if (currentAssignment) {
      await this.prisma.leafletAssignment.update({
        where: { id: currentAssignment.id },
        data: { unassignedAt: new Date() },
      });
    }

    return await this.createAssignment(leaflet.id, input);
  }

  private async createAssignment(
    leafletId: string,
    input: { fullName: string; phone: string; rewardPerClient: number; note?: string },
  ) {
    const fullName = input.fullName.trim();
    const phone = this.normalizePhone(input.phone);
    const rewardPerClient = Math.floor(Number(input.rewardPerClient));

    if (!fullName) throw new BadRequestException('fullName is required');
    if (!phone) throw new BadRequestException('phone is required');
    if (!Number.isFinite(rewardPerClient) || rewardPerClient < 0) {
      throw new BadRequestException('rewardPerClient must be >= 0');
    }

    const distributor =
      (await this.prisma.distributor.findFirst({ where: { phone } })) ??
      (await this.prisma.distributor.create({
        data: { fullName, phone },
      }));

    // если раздатчик уже был — обновим ФИО, чтобы было актуально
    if (distributor.fullName !== fullName) {
      await this.prisma.distributor.update({
        where: { id: distributor.id },
        data: { fullName },
      });
    }

    return await this.prisma.leafletAssignment.create({
      data: {
        leafletId,
        distributorId: distributor.id,
        rewardPerClient,
        note: input.note?.trim() || null,
      },
      include: { distributor: true, leaflet: true },
    });
  }

  async activateByCode(
    publicCode: string,
    input: { note?: string },
    activatedById: string,
  ) {
    const { leaflet, currentAssignment } = await this.byCode(publicCode);
    if (!currentAssignment) {
      throw new BadRequestException('Leaflet is not assigned yet');
    }

    return await this.prisma.activation.create({
      data: {
        leafletId: leaflet.id,
        assignmentId: currentAssignment.id,
        note: input.note?.trim() || null,
        activatedById,
      },
    });
  }
}



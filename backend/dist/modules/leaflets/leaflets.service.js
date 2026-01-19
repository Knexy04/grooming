"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeafletsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let LeafletsService = class LeafletsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async byCode(publicCode) {
        const code = publicCode.trim();
        const leaflet = await this.prisma.leaflet.findUnique({
            where: { publicCode: code },
            include: { campaign: true },
        });
        if (!leaflet)
            throw new common_1.NotFoundException('Leaflet not found');
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
    normalizePhone(phone) {
        return phone.replace(/[^\d+]/g, '').trim();
    }
    async assignByCode(publicCode, input) {
        const { leaflet, currentAssignment } = await this.byCode(publicCode);
        if (currentAssignment) {
            throw new common_1.ConflictException('Leaflet already assigned');
        }
        return await this.createAssignment(leaflet.id, input);
    }
    async reassignByCode(publicCode, input) {
        const { leaflet, currentAssignment } = await this.byCode(publicCode);
        if (currentAssignment) {
            await this.prisma.leafletAssignment.update({
                where: { id: currentAssignment.id },
                data: { unassignedAt: new Date() },
            });
        }
        return await this.createAssignment(leaflet.id, input);
    }
    async createAssignment(leafletId, input) {
        const fullName = input.fullName.trim();
        const phone = this.normalizePhone(input.phone);
        const rewardPerClient = Math.floor(Number(input.rewardPerClient));
        if (!fullName)
            throw new common_1.BadRequestException('fullName is required');
        if (!phone)
            throw new common_1.BadRequestException('phone is required');
        if (!Number.isFinite(rewardPerClient) || rewardPerClient < 0) {
            throw new common_1.BadRequestException('rewardPerClient must be >= 0');
        }
        const distributor = (await this.prisma.distributor.findFirst({ where: { phone } })) ??
            (await this.prisma.distributor.create({
                data: { fullName, phone },
            }));
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
    async activateByCode(publicCode, input, activatedById) {
        const { leaflet, currentAssignment } = await this.byCode(publicCode);
        if (!currentAssignment) {
            throw new common_1.BadRequestException('Leaflet is not assigned yet');
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
};
exports.LeafletsService = LeafletsService;
exports.LeafletsService = LeafletsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeafletsService);
//# sourceMappingURL=leaflets.service.js.map
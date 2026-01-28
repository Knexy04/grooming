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
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../../prisma/prisma.service");
let CampaignsService = class CampaignsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    generatePublicCode() {
        return (0, crypto_1.randomBytes)(6).toString('base64url').slice(0, 8);
    }
    async list() {
        const campaigns = await this.prisma.campaign.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return campaigns;
    }
    async create(input) {
        const name = input.name.trim();
        if (!name)
            throw new common_1.BadRequestException('name is required');
        return await this.prisma.campaign.create({
            data: { name, note: input.note?.trim() || null },
        });
    }
    async get(id) {
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
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        return campaign;
    }
    async delete(id) {
        const campaign = await this.prisma.campaign.findUnique({ where: { id } });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        await this.prisma.campaign.delete({ where: { id } });
        return { ok: true };
    }
    async createLeaflet(campaignId, input) {
        const campaign = await this.prisma.campaign.findUnique({
            where: { id: campaignId },
        });
        if (!campaign)
            throw new common_1.NotFoundException('Campaign not found');
        const printCount = Math.max(1, Math.min(50000, input.printCount ?? 1));
        const note = input.note?.trim() || null;
        let lastErr = null;
        for (let attempt = 0; attempt < 10; attempt++) {
            const publicCode = this.generatePublicCode();
            try {
                return await this.prisma.leaflet.create({
                    data: { campaignId, publicCode, note, printCount },
                });
            }
            catch (e) {
                lastErr = e;
            }
        }
        throw lastErr;
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map
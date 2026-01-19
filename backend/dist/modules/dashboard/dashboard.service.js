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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DashboardService = class DashboardService {
    constructor(prisma) {
        this.prisma = prisma;
    }
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
    async batchesTable(campaignId) {
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
                if (!a.unassignedAt)
                    activeBatches += 1;
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
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map
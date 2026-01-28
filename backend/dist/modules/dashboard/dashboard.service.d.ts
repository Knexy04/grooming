import { PrismaService } from '../../prisma/prisma.service';
export declare class DashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    summary(): Promise<{
        campaigns: number;
        batches: number;
        activations: number;
        totalPayout: number;
    }>;
    campaignsTable(): Promise<{
        id: string;
        name: string;
        status: string;
        note: string;
        createdAt: Date;
        batches: number;
        activations: number;
    }[]>;
    batchesTable(campaignId?: string): Promise<{
        id: string;
        publicCode: string;
        printCount: number;
        status: string;
        note: string;
        createdAt: Date;
        activations: number;
        campaign: {
            id: string;
            name: string;
        };
        currentDistributor: {
            id: string;
            fullName: string;
            phone: string;
            rewardPerClient: number;
        };
    }[]>;
    distributorsTable(): Promise<{
        id: string;
        fullName: string;
        phone: string;
        note: string;
        createdAt: Date;
        activeBatches: number;
        activations: number;
        payout: number;
    }[]>;
    recentActivations(take?: number): Promise<{
        id: string;
        activatedAt: Date;
        note: string;
        campaign: {
            id: string;
            name: string;
        };
        batch: {
            id: string;
            publicCode: string;
        };
        distributor: {
            id: string;
            fullName: string;
            phone: string;
        };
        rewardPerClient: number;
        activatedBy: {
            id: string;
            email: string;
        };
    }[]>;
    distributorOverview(distributorId: string): Promise<{
        me: {
            id: string;
            fullName: string;
            phone: string;
            note: string;
            createdAt: Date;
            activeBatches: number;
            activations: number;
            payout: number;
        };
        peers: {
            id: string;
            fullName: string;
            phone: string;
            note: string;
            createdAt: Date;
            activeBatches: number;
            activations: number;
            payout: number;
        }[];
    }>;
    distributorBatches(distributorId: string): Promise<{
        id: string;
        assignedAt: Date;
        unassignedAt: Date;
        rewardPerClient: number;
        note: string;
        leaflet: {
            id: string;
            publicCode: string;
            printCount: number;
            status: string;
            campaign: {
                id: string;
                name: string;
            };
        };
        activations: number;
        payout: number;
    }[]>;
}

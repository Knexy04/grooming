import { PrismaService } from '../../prisma/prisma.service';
export declare class LeafletsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    byCode(publicCode: string): Promise<{
        leaflet: {
            id: string;
            publicCode: string;
            printCount: number;
            status: string;
            note: string;
            createdAt: Date;
        };
        campaign: {
            id: string;
            name: string;
            status: string;
            note: string;
        };
        currentAssignment: {
            id: string;
            assignedAt: Date;
            rewardPerClient: number;
            note: string;
            distributor: {
                id: string;
                fullName: string;
                phone: string;
            };
        };
    }>;
    private normalizePhone;
    assignByCode(publicCode: string, input: {
        fullName: string;
        phone: string;
        rewardPerClient: number;
        note?: string;
    }): Promise<{
        leaflet: {
            id: string;
            createdAt: Date;
            note: string | null;
            status: string;
            campaignId: string;
            publicCode: string;
            printCount: number;
        };
        distributor: {
            id: string;
            createdAt: Date;
            fullName: string;
            phone: string;
            note: string | null;
        };
    } & {
        id: string;
        note: string | null;
        leafletId: string;
        distributorId: string;
        rewardPerClient: number;
        assignedAt: Date;
        unassignedAt: Date | null;
    }>;
    reassignByCode(publicCode: string, input: {
        fullName: string;
        phone: string;
        rewardPerClient: number;
        note?: string;
    }): Promise<{
        leaflet: {
            id: string;
            createdAt: Date;
            note: string | null;
            status: string;
            campaignId: string;
            publicCode: string;
            printCount: number;
        };
        distributor: {
            id: string;
            createdAt: Date;
            fullName: string;
            phone: string;
            note: string | null;
        };
    } & {
        id: string;
        note: string | null;
        leafletId: string;
        distributorId: string;
        rewardPerClient: number;
        assignedAt: Date;
        unassignedAt: Date | null;
    }>;
    private createAssignment;
    activateByCode(publicCode: string, input: {
        note?: string;
    }, activatedById: string): Promise<{
        id: string;
        note: string | null;
        leafletId: string;
        assignmentId: string | null;
        activatedAt: Date;
        activatedById: string;
    }>;
}

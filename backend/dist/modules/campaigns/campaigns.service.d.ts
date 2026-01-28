import { PrismaService } from '../../prisma/prisma.service';
export declare class CampaignsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private generatePublicCode;
    list(): Promise<{
        id: string;
        name: string;
        status: string;
        note: string | null;
        createdAt: Date;
    }[]>;
    create(input: {
        name: string;
        note?: string;
    }): Promise<{
        id: string;
        name: string;
        status: string;
        note: string | null;
        createdAt: Date;
    }>;
    get(id: string): Promise<{
        leaflets: ({
            _count: {
                activations: number;
            };
            assignments: ({
                distributor: {
                    id: string;
                    note: string | null;
                    createdAt: Date;
                    fullName: string;
                    phone: string;
                };
            } & {
                id: string;
                note: string | null;
                assignedAt: Date;
                leafletId: string;
                distributorId: string;
                rewardPerClient: number;
                unassignedAt: Date | null;
            })[];
        } & {
            id: string;
            status: string;
            note: string | null;
            createdAt: Date;
            campaignId: string;
            publicCode: string;
            printCount: number;
        })[];
    } & {
        id: string;
        name: string;
        status: string;
        note: string | null;
        createdAt: Date;
    }>;
    delete(id: string): Promise<{
        ok: boolean;
    }>;
    createLeaflet(campaignId: string, input: {
        note?: string;
        printCount?: number;
    }): Promise<{
        id: string;
        status: string;
        note: string | null;
        createdAt: Date;
        campaignId: string;
        publicCode: string;
        printCount: number;
    }>;
}

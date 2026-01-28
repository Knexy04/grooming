import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private readonly campaigns;
    constructor(campaigns: CampaignsService);
    list(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        note: string | null;
        status: string;
    }[]>;
    create(body: {
        name?: string;
        note?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        note: string | null;
        status: string;
    }>;
    get(id: string): Promise<{
        leaflets: ({
            assignments: ({
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
            })[];
            _count: {
                activations: number;
            };
        } & {
            id: string;
            createdAt: Date;
            note: string | null;
            status: string;
            campaignId: string;
            publicCode: string;
            printCount: number;
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        note: string | null;
        status: string;
    }>;
    delete(id: string): Promise<{
        ok: boolean;
    }>;
    createLeaflet(campaignId: string, body: {
        note?: string;
        printCount?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        note: string | null;
        status: string;
        campaignId: string;
        publicCode: string;
        printCount: number;
    }>;
}

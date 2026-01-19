import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private readonly campaigns;
    constructor(campaigns: CampaignsService);
    list(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: string;
        note: string | null;
    }[]>;
    create(body: {
        name?: string;
        note?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        status: string;
        note: string | null;
    }>;
    get(id: string): Promise<{
        leaflets: ({
            _count: {
                activations: number;
            };
            assignments: ({
                distributor: {
                    id: string;
                    createdAt: Date;
                    note: string | null;
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
            createdAt: Date;
            status: string;
            note: string | null;
            campaignId: string;
            publicCode: string;
            printCount: number;
        })[];
    } & {
        id: string;
        createdAt: Date;
        name: string;
        status: string;
        note: string | null;
    }>;
    createLeaflet(campaignId: string, body: {
        note?: string;
        printCount?: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        status: string;
        note: string | null;
        campaignId: string;
        publicCode: string;
        printCount: number;
    }>;
}

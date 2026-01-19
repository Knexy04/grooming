import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboard;
    constructor(dashboard: DashboardService);
    summary(): Promise<{
        campaigns: number;
        batches: number;
        activations: number;
        totalPayout: number;
    }>;
    campaigns(): Promise<{
        id: string;
        name: string;
        status: string;
        note: string;
        createdAt: Date;
        batches: number;
        activations: number;
    }[]>;
    batches(campaignId?: string): Promise<{
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
    distributors(): Promise<{
        id: string;
        fullName: string;
        phone: string;
        note: string;
        createdAt: Date;
        activeBatches: number;
        activations: number;
        payout: number;
    }[]>;
    activations(take?: string): Promise<{
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
}

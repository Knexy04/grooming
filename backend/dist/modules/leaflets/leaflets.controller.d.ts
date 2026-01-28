import { Response } from 'express';
import type { AuthedRequest } from '../auth/jwt.guard';
import { LeafletsService } from './leaflets.service';
export declare class LeafletsController {
    private readonly leaflets;
    constructor(leaflets: LeafletsService);
    byCode(code: string): Promise<{
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
    assign(code: string, body: {
        fullName?: string;
        phone?: string;
        rewardPerClient?: number;
        note?: string;
    }): Promise<{
        distributor: {
            id: string;
            createdAt: Date;
            fullName: string;
            phone: string;
            note: string | null;
        };
        leaflet: {
            id: string;
            createdAt: Date;
            note: string | null;
            status: string;
            campaignId: string;
            publicCode: string;
            printCount: number;
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
    reassign(code: string, body: {
        fullName?: string;
        phone?: string;
        rewardPerClient?: number;
        note?: string;
    }): Promise<{
        distributor: {
            id: string;
            createdAt: Date;
            fullName: string;
            phone: string;
            note: string | null;
        };
        leaflet: {
            id: string;
            createdAt: Date;
            note: string | null;
            status: string;
            campaignId: string;
            publicCode: string;
            printCount: number;
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
    activate(code: string, body: {
        note?: string;
    }, req: AuthedRequest): Promise<{
        id: string;
        note: string | null;
        leafletId: string;
        assignmentId: string | null;
        activatedAt: Date;
        activatedById: string;
    }>;
    pdf(code: string, res: Response): Promise<void>;
}

import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly auth;
    constructor(auth: AuthService);
    login(body: {
        email?: string;
        password?: string;
    }): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    distributorLogin(body: {
        phone?: string;
    }): Promise<{
        distributor: {
            id: string;
            fullName: string;
            phone: string;
            note: string;
            createdAt: Date;
        };
        stats: {
            activeBatches: number;
            activations: number;
            payout: number;
        };
    }>;
}

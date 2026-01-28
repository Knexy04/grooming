import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../prisma/prisma.service';
export declare class AuthService {
    private readonly prisma;
    private readonly jwt;
    constructor(prisma: PrismaService, jwt: JwtService);
    private normalizePhone;
    ensureDefaultAdmin(): Promise<void>;
    login(email: string, password: string): Promise<{
        token: string;
        user: {
            id: string;
            email: string;
        };
    }>;
    verifyToken(token: string): Promise<any>;
    distributorLogin(rawPhone: string): Promise<{
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

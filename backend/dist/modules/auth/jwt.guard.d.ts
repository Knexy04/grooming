import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';
export type AuthedRequest = Request & {
    user?: {
        id: string;
        email: string;
    };
};
export declare class JwtGuard implements CanActivate {
    private readonly auth;
    constructor(auth: AuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}

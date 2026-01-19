import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from './auth.service';

export type AuthedRequest = Request & {
  user?: { id: string; email: string };
};

@Injectable()
export class JwtGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<AuthedRequest>();
    const header = req.headers['authorization'] ?? '';
    const value = Array.isArray(header) ? header[0] : header;
    const m = value.match(/^Bearer\s+(.+)$/i);
    if (!m) throw new UnauthorizedException('Missing bearer token');

    try {
      const payload = await this.auth.verifyToken(m[1]);
      req.user = { id: payload.sub, email: payload.email };
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
    return true;
  }
}



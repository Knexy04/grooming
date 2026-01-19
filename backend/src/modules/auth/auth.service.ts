import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CONFIG } from '../../config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async ensureDefaultAdmin() {
    const count = await this.prisma.user.count();
    if (count > 0) return;

    const passwordHash = await bcrypt.hash(CONFIG.adminPassword, 10);
    await this.prisma.user.create({
      data: {
        email: CONFIG.adminEmail,
        passwordHash,
      },
    });
  }

  async login(email: string, password: string) {
    await this.ensureDefaultAdmin();

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const token = await this.jwt.signAsync({ sub: user.id, email: user.email });
    return {
      token,
      user: { id: user.id, email: user.email },
    };
  }

  async verifyToken(token: string) {
    return await this.jwt.verifyAsync(token, { secret: CONFIG.jwtSecret });
  }
}



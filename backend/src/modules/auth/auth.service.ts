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

  private normalizePhone(phone: string) {
    const digits = (phone ?? '').replace(/[^\d]/g, '');
    if (!digits) return '';
    // Если ввели 11 цифр и первая 8 — считаем это российским номером и делаем +7
    if (digits.length === 11 && digits.startsWith('8')) {
      return '+7' + digits.slice(1);
    }
    // Если уже начинается с "7" и всего 11 цифр — тоже приводим к +7
    if (digits.length === 11 && digits.startsWith('7')) {
      return '+7' + digits.slice(1);
    }
    // Если 10 цифр — добавим +7
    if (digits.length === 10) {
      return '+7' + digits;
    }
    // Иначе просто вернем с плюсом, если нет
    return digits.startsWith('+') ? digits : '+' + digits;
  }

  // --- ADMIN AUTH ---
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

  // --- DISTRIBUTOR "LOGIN" (BY PHONE) ---
  async distributorLogin(rawPhone: string) {
    const phone = this.normalizePhone(rawPhone ?? '');
    if (!phone) {
      throw new UnauthorizedException('Укажи номер телефона');
    }

    const distributor = await this.prisma.distributor.findFirst({
      where: { phone },
      include: { assignments: { include: { activations: true } } },
    });

    if (!distributor) {
      throw new UnauthorizedException('Раздатчик с таким номером не найден');
    }

    // Базовые агрегаты для приветственного экрана
    let activations = 0;
    let payout = 0;
    let activeBatches = 0;
    for (const a of distributor.assignments) {
      activations += a.activations.length;
      payout += a.activations.length * a.rewardPerClient;
      if (!a.unassignedAt) activeBatches += 1;
    }

    return {
      distributor: {
        id: distributor.id,
        fullName: distributor.fullName,
        phone: distributor.phone,
        note: distributor.note,
        createdAt: distributor.createdAt,
      },
      stats: {
        activeBatches,
        activations,
        payout,
      },
    };
  }
}



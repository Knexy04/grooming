import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() body: { email?: string; password?: string }) {
    const email = (body.email ?? '').trim().toLowerCase();
    const password = body.password ?? '';
    return await this.auth.login(email, password);
  }
}



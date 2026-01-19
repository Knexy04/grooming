import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LeafletsController } from './leaflets.controller';
import { LeafletsService } from './leaflets.service';

@Module({
  imports: [AuthModule],
  controllers: [LeafletsController],
  providers: [LeafletsService],
})
export class LeafletsModule {}



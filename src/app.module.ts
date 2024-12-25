import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma.service';
import { ApplicationModule } from './application/application.module';

@Module({
  imports: [ AuthModule, UserModule, ApplicationModule],
  providers: [PrismaService],
})
export class AppModule {}

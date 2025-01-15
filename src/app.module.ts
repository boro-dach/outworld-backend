import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaService } from './prisma.service';
import { ApplicationModule } from './application/application.module';
import { EventModule } from './event/event.module';
import { NewModule } from './new/new.module';

@Module({
  imports: [ AuthModule, UserModule, ApplicationModule, EventModule, NewModule],
  providers: [PrismaService],
})
export class AppModule {}

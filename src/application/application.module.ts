import { Module } from '@nestjs/common';
import { ApplicationService } from './application.service';
import { ApplicationController } from './application.controller';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [ApplicationController],
  providers: [ApplicationService, PrismaService, UserService],
})
export class ApplicationModule {}

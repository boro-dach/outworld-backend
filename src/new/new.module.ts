import { Module } from '@nestjs/common';
import { NewService } from './new.service';
import { NewController } from './new.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [NewController],
  providers: [NewService, PrismaService],
})
export class NewModule {}

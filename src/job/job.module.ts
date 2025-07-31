import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JobService } from './job.service';
import { JobController } from './job.controller';

@Module({
  providers: [JobService, PrismaService],
  controllers: [JobController],
})
export class JobModule {}

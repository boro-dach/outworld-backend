import { Module } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { VacancyController } from './vacancy.controller';
import { PrismaService } from 'src/prisma.service';
import { JobService } from 'src/job/job.service';

@Module({
  controllers: [VacancyController],
  providers: [VacancyService, PrismaService, JobService],
})
export class VacancyModule {}

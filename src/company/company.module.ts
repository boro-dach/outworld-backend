import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { PrismaService } from 'src/prisma.service';
import { JobService } from 'src/job/job.service';
import { CardService } from 'src/card/card.service';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService, PrismaService, JobService, CardService],
})
export class CompanyModule {}

import { Module } from '@nestjs/common';
import { BankService } from './bank.service';
import { BankController } from './bank.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [BankController],
  providers: [BankService, PrismaService],
})
export class BankModule {}

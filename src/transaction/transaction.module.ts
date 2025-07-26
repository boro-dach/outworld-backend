import { Module } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { MinecraftModule } from 'src/minecraft/minecraft.module';
import { TransactionController } from './transaction.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  imports: [MinecraftModule],
  controllers: [TransactionController],
  providers: [TransactionService, PrismaService],
})
export class TransactionModule {}

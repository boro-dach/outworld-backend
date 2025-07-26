import { Module } from '@nestjs/common';
import { MinecraftService } from './minecraft.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  providers: [MinecraftService, ConfigService],
  exports: [MinecraftService],
})
export class MinecraftModule {}

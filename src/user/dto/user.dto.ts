import { IsBoolean, IsEnum, IsString } from 'class-validator';
import { Jobs } from 'generated/prisma';

export class UpdateIsVerifiedDto {
  @IsString()
  id: string;

  @IsBoolean()
  isVerified: boolean;
}

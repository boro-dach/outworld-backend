import { IsEnum, IsString } from 'class-validator';
import { Jobs } from 'generated/prisma';

export class JobAssignDto {
  @IsString()
  userId: string;

  @IsEnum(Jobs)
  job: Jobs;
}

import { IsEnum, IsString, Max } from 'class-validator';
import { ApplicationStatus } from 'generated/prisma';

export class CreateApplicationDto {
  @IsString()
  @Max(500)
  text: string;
}

export class UpdateApplicationStatusDto {
  @IsString()
  id: string;

  @IsEnum(ApplicationStatus)
  status: ApplicationStatus;
}

export class DeleteApplicationDto {
  @IsString()
  id: string;
}

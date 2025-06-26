import { IsBoolean, IsString } from 'class-validator';

export class UpdateIsVerifiedDto {
  @IsString()
  id: string;

  @IsBoolean()
  isVerified: boolean;
}

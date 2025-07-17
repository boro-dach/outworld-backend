import { IsEmail, IsString, Min } from 'class-validator';
import { UserRole } from 'generated/prisma';

export class RegisterDto {
  @IsString()
  @Min(1)
  login: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @Min(6)
  password: string;
}

export class LoginDto {
  @IsString()
  @Min(1)
  login: string;

  @IsString()
  @Min(6)
  password: string;
}

export interface TokenPayload {
  userId: string;
  login: string;
  role: UserRole;
  email: string;
}

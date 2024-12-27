import { Role } from "@prisma/client";
import { IsEnum, IsNotEmpty } from "class-validator";

export class UpdateUserDto {
  @IsEnum(Role)
  @IsNotEmpty()
  role: Role;
}
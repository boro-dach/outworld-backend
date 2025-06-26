import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Role } from './roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { UserRole } from 'generated/prisma';

export const Auth = (...roles: UserRole[]) => {
  return applyDecorators(Role(...roles), UseGuards(JwtAuthGuard, RolesGuard));
};

import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'generated/prisma';

export const ROLES_KEY = 'roles';
export const Role = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

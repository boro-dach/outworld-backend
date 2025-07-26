import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JOBS_KEY } from '../decorators/jobs.decorator';
import type { Jobs } from 'generated/prisma';

@Injectable()
export class JobsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredJobs = this.reflector.getAllAndOverride<Jobs[]>(JOBS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredJobs) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user) {
      return false;
    }

    return requiredJobs.includes(user.job);
  }
}

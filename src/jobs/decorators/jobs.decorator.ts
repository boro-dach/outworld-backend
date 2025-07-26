import { SetMetadata } from '@nestjs/common';
import type { Jobs } from 'generated/prisma';

export const JOBS_KEY = 'jobs';

export const Job = (...jobs: Jobs[]) => SetMetadata(JOBS_KEY, jobs);

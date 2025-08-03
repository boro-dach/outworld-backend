import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { JobAssignDto } from './dto/job.dto';

@Injectable()
export class JobService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string) {
    const jobs = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        jobs: true,
      },
    });

    return jobs.jobs;
  }

  async assign(dto: JobAssignDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
      select: { jobs: true, id: true, login: true },
    });

    if (user?.jobs?.includes(dto.job)) {
      return {
        id: user.id,
        login: user.login,
        jobs: user.jobs,
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: dto.userId },
      data: {
        jobs: {
          push: dto.job,
        },
      },
      select: {
        id: true,
        login: true,
        jobs: true,
      },
    });

    return {
      id: updatedUser.id,
      login: updatedUser.login,
      jobs: updatedUser.jobs,
    };
  }
}

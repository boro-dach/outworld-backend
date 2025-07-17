import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import {
  CreateApplicationDto,
  DeleteApplicationDto,
  UpdateApplicationStatusDto,
} from './dto/application.dto';
import { ApplicationStatus } from 'generated/prisma';
import { UserService } from 'src/user/user.service';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly user: UserService,
  ) {}

  async create(dto: CreateApplicationDto, userId: string) {
    const application = await this.prisma.application.create({
      data: {
        text: dto.text,
        userId: userId,
      },
    });

    return application;
  }

  async updateStatus(dto: UpdateApplicationStatusDto) {
    const application = await this.prisma.application.update({
      where: { id: dto.id },
      data: { status: dto.status },
    });

    if (application.status === ApplicationStatus.APPROVED) {
      await this.user.updateIsVerified({
        id: application.userId,
        isVerified: true,
      });
    }

    return application;
  }

  async delete(dto: DeleteApplicationDto) {
    const application = await this.prisma.application.delete({
      where: { id: dto.id },
    });

    return application;
  }

  async get(userId: string) {
    const application = await this.prisma.application.findMany({
      where: { userId: userId },
    });

    return application;
  }
}

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AcceptApplyDto,
  ApplyToVacancyDto,
  CreateVacancyDto,
  GetAppliesByVacancyDto,
  getByCompanyDto,
  RejectApplyDto,
} from './dto/vacancy.dto';
import { PrismaService } from 'src/prisma.service';
import { VacancyResponseStatus } from 'generated/prisma';
import { JobService } from 'src/job/job.service';

@Injectable()
export class VacancyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jobService: JobService,
  ) {}

  async getAll() {
    const vacancies = await this.prisma.vacancy.findMany({
      include: { salary: true, company: true },
    });

    return vacancies;
  }

  async getByCompany(dto: getByCompanyDto) {
    const vacancies = await this.prisma.vacancy.findMany({
      where: { companyId: dto.companyId },
      include: {
        salary: true,
        company: true,
      },
    });

    return vacancies;
  }

  async apply(dto: ApplyToVacancyDto, userId: string) {
    const oldResponse = await this.prisma.vacancyResponse.findFirst({
      where: { vacancyId: dto.vacancyId, userId },
    });

    if (oldResponse) {
      throw new BadRequestException('Вы уже откликались на эту вакансию');
    }

    const newResponse = await this.prisma.vacancyResponse.create({
      data: {
        coverLetter: dto.coverLetter,

        user: {
          connect: {
            id: userId,
          },
        },

        vacancy: {
          connect: {
            id: dto.vacancyId,
          },
        },
      },
    });

    return newResponse;
  }

  async acceptApply(dto: AcceptApplyDto, ceoId: string) {
    return this.prisma.$transaction(async (tx) => {
      const apply = await tx.vacancyResponse.findUnique({
        where: { id: dto.applyId },
        include: {
          vacancy: {
            include: { company: true },
          },
        },
      });

      if (!apply) {
        throw new NotFoundException('Отклик не найден');
      }

      if (apply.vacancy.company.ceoId !== ceoId) {
        throw new ForbiddenException(
          'У вас нет прав для управления этой вакансией',
        );
      }

      if (apply.status === VacancyResponseStatus.ACCEPTED) {
        throw new BadRequestException('Отклик уже принят');
      }

      const updatedApply = await tx.vacancyResponse.update({
        where: { id: dto.applyId },
        data: {
          status: VacancyResponseStatus.ACCEPTED,
        },
      });

      await tx.company.update({
        where: { id: apply.vacancy.company.id },
        data: {
          employees: {
            connect: { id: apply.userId },
          },
        },
      });

      await this.jobService.assign({
        userId: apply.userId,
        job: apply.vacancy.occupation,
      });

      return updatedApply;
    });
  }

  async rejectApply(dto: RejectApplyDto) {
    const apply = await this.prisma.vacancyResponse.update({
      where: { id: dto.applyId },
      data: {
        status: VacancyResponseStatus.REJECTED,
      },
    });

    return apply;
  }

  async getAppliesByVacancy(dto: GetAppliesByVacancyDto) {
    const applies = await this.prisma.vacancyResponse.findMany({
      where: { vacancyId: dto.vacancyId },
      include: {
        user: true,
      },
    });

    return applies;
  }

  async getAppliesByUser(userId: string) {
    const applies = await this.prisma.vacancyResponse.findMany({
      where: { userId },
    });

    return applies;
  }

  async create(dto: CreateVacancyDto) {
    const vacancy = await this.prisma.vacancy.create({
      data: {
        title: dto.title,
        description: dto.description,
        occupation: dto.occupation,
        companyId: dto.companyId,
        salary: {
          create: {
            type: dto.salary.type,
            period: dto.salary.period,
            fixedAmount: dto.salary.fixedAmount,
            minAmount: dto.salary.minAmount,
            maxAmount: dto.salary.maxAmount,
          },
        },
      },
      include: {
        salary: true,
      },
    });

    return vacancy;
  }

  async update(dto: CreateVacancyDto, id: string) {
    return this.prisma.vacancy.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
        occupation: dto.occupation,
        salary: {
          update: {
            type: dto.salary.type,
            period: dto.salary.period,
            fixedAmount: dto.salary.fixedAmount,
            minAmount: dto.salary.minAmount,
            maxAmount: dto.salary.maxAmount,
          },
        },
      },
      include: {
        salary: true,
      },
    });
  }

  async delete(id: string) {
    return this.prisma.vacancy.delete({
      where: { id },
    });
  }
}

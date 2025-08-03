import { Injectable } from '@nestjs/common';
import { CreateVacancyDto } from './dto/vacancy.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class VacancyService {
  constructor(private readonly prisma: PrismaService) {}

  async getAll() {
    const vacancies = await this.prisma.vacancy.findMany();

    return vacancies;
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

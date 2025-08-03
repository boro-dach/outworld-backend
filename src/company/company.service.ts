import { BadRequestException, Injectable } from '@nestjs/common';
import { AddEmployeeDto, CreateCompanyDto } from './dto/company.dto';
import { PrismaService } from 'src/prisma.service';
import { CardService } from 'src/card/card.service';
import { JobService } from 'src/job/job.service';
import { Jobs, Prisma } from 'generated/prisma';

@Injectable()
export class CompanyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cardService: CardService,
    private readonly jobService: JobService,
  ) {}

  async getMy(userId: string) {
    const companies = await this.prisma.company.findMany({
      where: { ceoId: userId },
      include: { employees: true },
    });

    return companies;
  }

  async addEmployee(dto: AddEmployeeDto, tx?: Prisma.TransactionClient) {
    const prismaClient = tx || this.prisma;

    const company = await prismaClient.company.update({
      where: { id: dto.companyId },
      data: {
        employees: {
          connect: { id: dto.employeeId },
        },
      },
      include: { employees: true },
    });

    return company;
  }

  async create(dto: CreateCompanyDto, userId: string) {
    const creationCost = 32;
    const stateCardNumber = '11111111';

    return this.prisma.$transaction(async (tx) => {
      await this.cardService._performSend(
        {
          fromCard: dto.payCard,
          toCard: stateCardNumber,
          amount: creationCost,
        },
        userId,
        tx,
      );

      const company = await tx.company.create({
        data: {
          title: dto.title,
          description: dto.description,
          ceoId: userId,
        },
      });

      await this.jobService.assign({ job: Jobs.BUSINESSMAN, userId });
      await this.addEmployee({ companyId: company.id, employeeId: userId }, tx);

      return company;
    });
  }
}
